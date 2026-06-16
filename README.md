Keystone.js
===========

Port of the [Keystone](https://github.com/keystone-engine/keystone) assembler framework for JavaScript/WASM. Powered by [Emscripten](https://github.com/emscripten-core/emscripten).

**Requirements:** JavaScript environment with [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) and [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) support.

**Notes:** _Keystone_ is a lightweight multi-architecture assembler framework originally developed by Nguyen Anh Quynh et al. and released under a dual GPLv2 and commercial license. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT`, `COPYING`, `EXCEPTIONS-CLIENT` and  `LICENSE-COM.TXT` of the *keystone* submodule in this repository.

## Installation

To add Keystone.js to your web application, include it with:

```html
<script src="keystone.js"></script>
```

or install it with the NPM command:

```bash
npm install @alexaltea/keystone-js
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

MKeystone().then((ks) => {
    // Initialize the encoder
    var a = new ks.Keystone(ks.ARCH_X86, ks.MODE_64);

    // Choose preferred syntax
    a.option(ks.OPT_SYNTAX, ks.OPT_SYNTAX_INTEL);

    // Assemble instructions
    var result = a.asm(assembly);
    console.log(result.failed); // false
    console.log(result.count); // 5
    console.log(result.mc); // Uint8Array([0x48, 0xFF, 0xC0, ...])

    // Delete encoder
    a.close();
});
```

## Building

To build the Keystone.js library:

1. Clone this repository including its submodules:
    ```bash
    git clone --recursive https://github.com/AlexAltea/keystone.js
    ```

2. Install the latest [Python 3.x](https://www.python.org/downloads/), [CMake](http://www.cmake.org/download/) and the [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html). Follow the corresponding instructions and make sure all environment variables are configured correctly.

3. Run the build script:
   ```bash
   python3 build.py
   ```

Build artifacts will be saved to [`dist`](./dist/).

> [!TIP]
> Pass architecture names to produce a smaller, single-architecture bundle (e.g. `python3 build.py x86`), or `python3 build.py --release` to build every variant.
