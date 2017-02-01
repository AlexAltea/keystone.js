#!/usr/bin/python

# INFORMATION:
# This scripts compiles the original Keystone framework to JavaScript

import os
import sys

EXPORTED_FUNCTIONS = [
    '_ks_open',
    '_ks_asm',
    '_ks_free',
    '_ks_close',
    '_ks_option',
    '_ks_strerror',
    '_ks_errno',
    '_ks_arch_supported',
    '_ks_version'
]

def compileKeystone(targets):
    # CMake
    cmd = 'cmake'
    cmd += os.path.expandvars(' -DCMAKE_TOOLCHAIN_FILE=$EMSCRIPTEN/cmake/Modules/Platform/Emscripten.cmake')
    cmd += ' -DCMAKE_BUILD_TYPE=Release'
    cmd += ' -DBUILD_SHARED_LIBS=OFF'
    cmd += ' -DCMAKE_CXX_FLAGS="-Os"'
    if targets:
        cmd += ' -DLLVM_TARGETS_TO_BUILD="%s"' % (';'.join(targets))
    if os.name == 'nt':
        cmd += ' -DMINGW=ON'
        cmd += ' -G \"MinGW Makefiles\"'
    if os.name == 'posix':
        cmd += ' -G \"Unix Makefiles\"'
    cmd += ' keystone/CMakeLists.txt'
    os.system(cmd)

    # MinGW (Windows) or Make (Linux/Unix)
    os.chdir('keystone')
    if os.name == 'nt':
        os.system('mingw32-make')
    if os.name == 'posix':
        os.system('make')
    os.chdir('..')

    # Compile static library to JavaScript
    cmd = os.path.expandvars('$EMSCRIPTEN/emcc')
    cmd += ' -Os --memory-init-file 0'
    cmd += ' keystone/llvm/lib/libkeystone.a'
    cmd += ' -s EXPORTED_FUNCTIONS=\"[\''+ '\', \''.join(EXPORTED_FUNCTIONS) +'\']\"'
    cmd += ' -s MODULARIZE=1'
    cmd += ' -s EXPORT_NAME="\'MKeystone\'"'
    if targets:
        cmd += ' -o src/libkeystone-%s.out.js' % ('-'.join(targets))
    else:
        cmd += ' -o src/libkeystone.out.js'
    os.system(cmd)


if __name__ == "__main__":
    targets = sorted(sys.argv[1:])
    if os.name in ['nt', 'posix']:
        compileKeystone(targets)        
    else:
        print "Your operating system is not supported by this script:"
        print "Please, use Emscripten to compile Keystone manually to src/keystone.out.js"
