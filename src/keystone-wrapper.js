/**
 * (c) 2016 Keystone.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

var ks = {
    // Return codes
    ERR_OK:           0,  // No error: everything was fine
    ERR_NOMEM:        1,  // Out-Of-Memory error: ks_open(), ks_emulate()
    ERR_ARCH:         2,  // Unsupported architecture: ks_open()
    ERR_HANDLE:       3,  // Invalid handle
    ERR_MODE:         4,  // Invalid/unsupported mode: ks_open()
    ERR_VERSION:      5,  // Unsupported version (bindings)
    ERR_OPT_INVALID:  6,  // Unsupported option

    // Architectures
    ARCH_ARM:         1,  // ARM architecture (including Thumb, Thumb-2)
    ARCH_ARM64:       2,  // ARM-64, also called AArch64
    ARCH_MIPS:        3,  // MIPS architecture
    ARCH_X86:         4,  // X86 architecture (including x86 & x86-64)
    ARCH_PPC:         5,  // PowerPC architecture (currently unsupported)
    ARCH_SPARC:       6,  // SPARC architecture
    ARCH_SYSTEMZ:     7,  // SystemZ architecture (S390X)
    ARCH_HEXAGON:     8,  // Hexagon architecture

    // Modes
    MODE_LITTLE_ENDIAN:    0,  // Little-Endian mode (default mode)
    MODE_BIG_ENDIAN: 1 << 31,  // Big-Endian mode
    MODE_X86_16:     1 <<  1,  // X86: 16-bit mode
    MODE_X86_32:     1 <<  2,  // X86: 32-bit mode
    MODE_X86_64:     1 <<  3,  // X86: 64-bit mode

    /**
     * Capstone object
     */
    Keystone: function (arch, mode) {
        this.arch = arch;
        this.mode = mode;
        this.handle_ptr = Module._malloc(4);

        // Destructor
        this.delete = function () {
            Module._free(this.handle_ptr);
        }

        // Disassemble
        this.disasm = function (buffer, addr, max) {
            var handle = Module.getValue(this.handle_ptr, 'i32');

            // TODO
        };

        // Constructor
        var ret = Module.ccall('ks_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );

        if (ret != ks.ERR_OK) {
            console.error('Keystone.js: Function ks_open failed with code %d.', ret);
        }
    },
};
