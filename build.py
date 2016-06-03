#!/usr/bin/python

# INFORMATION:
# This scripts compiles the original Keystone framework to JavaScript

import os

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

def compileKeystone():
	# CMake
	cmd = 'cmake'
	cmd += os.path.expandvars(' -DCMAKE_TOOLCHAIN_FILE=$EMSCRIPTEN/cmake/Modules/Platform/Emscripten.cmake')
	cmd += ' -DCMAKE_BUILD_TYPE=Release'
	cmd += ' -DCMAKE_C_FLAGS=\"-Wno-warn-absolute-paths\"'
	if os.name == 'nt':
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
	cmd += ' -O1'
	cmd += ' keystone/libkeystone.a'
	cmd += ' -s EXPORTED_FUNCTIONS=\"[\''+ '\', \''.join(EXPORTED_FUNCTIONS) +'\']\"'
	cmd += ' -o src/keystone.out.js'
	os.system(cmd)


if __name__ == "__main__":
	if os.name in ['nt', 'posix']:
		compileKeystone()		
	else:
		print "Your operating system is not supported by this script:"
		print "Please, use Emscripten to compile Keystone manually to src/keystone.out.js"
