Keystone.js
===========

Port of the [Keystone](https://github.com/keystone-engine/keystone) assembler framework for JavaScript. Powered by [Emscripten](https://github.com/kripken/emscripten).

**Notes:** _Keystone_ is a lightweight multi-architecture assembler framework originally developed by Nguyen Anh Quynh et al. and released under a dual license GPLv2 and the possibility of its commercial usage. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT` and the files mentioned by the *License* section in `README.md` inside the *keystone* submodule in this repository.

## Installation
To add Keystone.js to your web application, include it with:
```html
<script src="keystone.min.js"></script>
```
or install it with the Bower command:
```bash
bower install keystonejs
```

## Usage                                                      
```javascript
// Input: Assembly
var assembly = `
  inc   rax;
  call  0x10040;
  mov   rax, qword ptr[rdx + 4];
  sub   esp, 0x100;
  pop   rbx;
`;

// Initialize the encoder
var a = new ks.Keystone(ks.ARCH_X86, ks.MODE_64);

// Choose preferred syntax
a.option(ks.KS_OPT_SYNTAX, ks.OPT_SYNTAX_INTEL);

// Assemble instructions
var mc = a.asm(assembly);
/* mc = new Uint8Array([0x48, 0xFF, 0xC0, 0xE8, ...]); */

// Close encoder
a.close();
```

## Building
To build the Keystone.js library, clone the *master* branch of this repository, and do the following:

1. Initialize the original Keystone submodule: `git submodule update --init`.

2. Install the latest [Python 2.x (64-bit)](https://www.python.org/downloads/), [CMake](http://www.cmake.org/download/) and the [Emscripten SDK](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Follow the respective instructions and make sure all environment variables are configured correctly. Under Windows [MinGW](http://www.mingw.org/) (specifically *mingw32-make*) is required.

3. Install the development dependencies with: `npm install`.

4. Finally, build the source with: `grunt build`.
