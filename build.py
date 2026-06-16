#!/usr/bin/env python3

import json
import os
import re
import shutil
import subprocess
import sys
import zipfile

# Directories
KEYSTONE_DIR = os.path.abspath('keystone')
KEYSTONE_BUILD_DIR = os.path.join(KEYSTONE_DIR, 'build')
KEYSTONE_CONSTS_DIR = os.path.join(KEYSTONE_DIR, 'bindings', 'nodejs', 'consts')

EXPORTED_FUNCTIONS = [
    '_free',
    '_ks_arch_supported',
    '_ks_asm',
    '_ks_close',
    '_ks_errno',
    '_ks_free',
    '_ks_open',
    '_ks_option',
    '_ks_strerror',
    '_ks_version',
    '_malloc',
]

# Keystone architectures mapped to the LLVM target that implements each one.
# The architecture name (lower-cased) names the constants file, the per-arch
# bundle suffix and the demo selector; the LLVM target name is what Keystone's
# CMake build expects in LLVM_TARGETS_TO_BUILD.
AVAILABLE_ARCHITECTURES = {
    'ARM': 'ARM',
    'ARM64': 'AArch64',
    'HEXAGON': 'Hexagon',
    'MIPS': 'Mips',
    'PPC': 'PowerPC',
    'SPARC': 'Sparc',
    'SYSTEMZ': 'SystemZ',
    'X86': 'X86',
}


def generateConstants():
    """Generate src/constants_<arch>.js from Keystone's per-arch JS bindings.

    Keystone ships ready-made constant bindings under bindings/nodejs/consts/.
    Each per-arch binding only defines that architecture's ERR_ASM_<ARCH>_*
    constants; the shared ks_err/ks_arch/ks_mode/ks_opt_* enums live in the
    common keystone.js binding and are instead hard-coded in keystone-wrapper.js
    (see "Simplify common constants"). Each generated file is loaded into the
    module via Emscripten --post-js (see compileKeystone), so it merges its
    constants straight into Module, which becomes the public `ks` object.
    """
    for arch in AVAILABLE_ARCHITECTURES:
        prefix = arch.lower()
        binding = f'{prefix}.js'
        with open(f'src/constants_{prefix}.js', 'w') as out:
            out.write(f'// AUTO-GENERATED, DO NOT EDIT [{binding}]\n')
            out.write('Object.assign(Module, {\n')
            for line in open(os.path.join(KEYSTONE_CONSTS_DIR, binding)):
                match = re.match(r'module\.exports\.(\w+)\s*=\s*(.+?)\s*$', line.strip())
                if match:
                    name, value = match.groups()
                    out.write(f'  {name}: {value},\n')
            out.write('});\n')


def constant_files(archs):
    """Per-arch constants files from generateConstants(), loaded via --post-js."""
    wanted = {a.lower() for a in archs} if archs else None
    files = []
    for arch in AVAILABLE_ARCHITECTURES:
        prefix = arch.lower()
        if wanted and prefix not in wanted:
            continue
        files.append(f'src/constants_{prefix}.js')
    return files


def package_build(suffix):
    """Zip the .js/.wasm pair into dist/keystone{suffix}_{version}.zip."""
    version = json.load(open('package.json'))['version']
    zip_path = f'dist/keystone{suffix}_{version}.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for path in (f'dist/keystone{suffix}.js', f'dist/keystone{suffix}.wasm'):
            zf.write(path, os.path.basename(path))


def compileKeystone(archs=[], package=False):
    archs = [a.upper() for a in archs]
    shutil.rmtree(KEYSTONE_BUILD_DIR, ignore_errors=True)

    # Configure with CMake
    targets = [AVAILABLE_ARCHITECTURES[a] for a in archs] if archs \
        else list(AVAILABLE_ARCHITECTURES.values())
    cmd = [
        'emcmake', 'cmake',
        '-S', KEYSTONE_DIR,
        '-B', KEYSTONE_BUILD_DIR,
        '-G', 'Unix Makefiles',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_CXX_FLAGS=-Os',
        '-DBUILD_SHARED_LIBS=OFF',
        '-DBUILD_LIBS_ONLY=1',
        f'-DLLVM_TARGETS_TO_BUILD={";".join(targets)}',
    ]
    subprocess.run(cmd, check=True)

    # Build the static library
    jobs = os.cpu_count() or 1
    cmd = ['emmake', 'make', f'-j{jobs}']
    subprocess.run(cmd, check=True, cwd=KEYSTONE_BUILD_DIR)

    # Port the static library to JavaScript/WASM
    suffix = ('_' + '+'.join(a.lower() for a in archs)) if archs else ''
    methods = ['ccall', 'getValue', 'setValue', 'UTF8ToString']
    cmd = [
        'emcc',
        '-Os',
        os.path.join(KEYSTONE_BUILD_DIR, 'llvm', 'lib', 'libkeystone.a'),
        '-s', f"EXPORTED_FUNCTIONS={EXPORTED_FUNCTIONS}",
        '-s', f"EXPORTED_RUNTIME_METHODS={methods}",
        '-s', 'ALLOW_MEMORY_GROWTH=1',
        '-s', 'MODULARIZE=1',
        '-s', 'WASM=1',
        '-s', 'WASM_BIGINT=1',
        '-s', "EXPORT_NAME='MKeystone'",
    ]
    for path in constant_files(archs):
        cmd += ['--post-js', path]
    cmd += ['--post-js', 'src/keystone-wrapper.js']
    cmd += ['-o', f'dist/keystone{suffix}.js']
    os.makedirs('dist', exist_ok=True)
    subprocess.run(cmd, check=True)
    if package:
        package_build(suffix)


if __name__ == "__main__":
    # Initialize Keystone submodule if necessary
    if not os.listdir(KEYSTONE_DIR):
        os.system("git submodule update --init")

    args = sys.argv[1:]
    package = '--package' in args
    release = '--release' in args
    generateConstants()
    if release:
        compileKeystone([], package) # Build all
        for arch in AVAILABLE_ARCHITECTURES:
            compileKeystone([arch], package)
    else:
        archs = sorted([a for a in args if not a.startswith('--')])
        compileKeystone(archs, package)
