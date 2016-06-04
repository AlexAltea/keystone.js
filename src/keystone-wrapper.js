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
    MODE_BIG_ENDIAN:  1 << 31,  // Big-Endian mode
    MODE_ARM:         1 <<  0,  // ARM/ARM64: ARM mode
    MODE_THUMB:       1 <<  4,  // ARM/ARM64: THUMB mode (including Thumb-2)
    MODE_V8:          1 <<  6,  // ARM/ARM64: ARMv8 A32 encodings for ARM
    MODE_MICRO:       1 <<  4,  // MIPS: MicroMips mode
    MODE_MIPS3:       1 <<  5,  // MIPS: Mips III ISA
    MODE_MIPS32R6:    1 <<  6,  // MIPS: Mips32r6 ISA
    MODE_MIPS32:      1 <<  2,  // MIPS: Mips32 ISA
    MODE_MIPS64:      1 <<  3,  // MIPS: Mips64 ISA
    MODE_16:          1 <<  1,  // X86: 16-bit mode
    MODE_32:          1 <<  2,  // X86: 32-bit mode
    MODE_64:          1 <<  3,  // X86: 64-bit mode
    MODE_PPC32:       1 <<  2,  // PPC: 32-bit mode
    MODE_PPC64:       1 <<  3,  // PPC: 64-bit mode
    MODE_QPX:         1 <<  4,  // PPC: Quad Processing eXtensions mode
    MODE_SPARC32:     1 <<  2,  // SPARC: 32-bit mode
    MODE_SPARC64:     1 <<  3,  // SPARC: 64-bit mode
    MODE_V9:          1 <<  4,  // SPARC: SparcV9 mode
    
    // Options
    OPT_SYNTAX:             1,  // Choose syntax for input assembly
    OPT_SYNTAX_INTEL: 1 <<  0,  // KS_OPT_SYNTAX: X86 Intel syntax - default on X86
    OPT_SYNTAX_ATT:   1 <<  1,  // KS_OPT_SYNTAX: X86 ATT asm syntax
    OPT_SYNTAX_NASM:  1 <<  2,  // KS_OPT_SYNTAX: X86 NASM syntax
    OPT_SYNTAX_MASM:  1 <<  3,  // KS_OPT_SYNTAX: X86 MASM syntax - unsupported yet
    OPT_SYNTAX_GAS:   1 <<  4,  // KS_OPT_SYNTAX: X86 GNU GAS syntax

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
        
        // Options
        this.option = function(option, value) {
            if (!handle) {
                return;
            }
            
            var ret = Module.ccall('ks_option', 'number',
                ['pointer', 'number', 'number'],
                [handle, option, value]
            );
        }

        // Assembler
        this.asm = function (assembly, address) {
            var handle = Module.getValue(this.handle_ptr, '*');
            if (!handle) {
                return [];
            }
            
            var insn_ptr = Module._malloc(4);
            var size_ptr = Module._malloc(4);
            var count_ptr = Module._malloc(4);
            
            // Allocate buffer and copy data
            var buffer_len = assembly.length + 1;
            var buffer_ptr = Module._malloc(buffer_len);
            var buffer_heap = new Uint8Array(Module.HEAPU8.buffer, buffer_ptr, buffer_len);
            Module.writeStringToMemory(assembly, buffer_ptr);  

            // Run the assembler. Note that the third argument is split
            // in the two integers that make the uint64_t address value.
            // Due to JavaScript limitations only the lower 32-bit can be modified.
            var ret = Module.ccall('ks_asm', 'number',
                ['pointer', 'pointer', 'number', 'number', 'pointer', 'pointer', 'pointer'],
                [handle, buffer_heap.byteOffset, address, 0x0, insn_ptr, size_ptr, count_ptr]
            );
            if (ret != ks.ERR_OK) {
                return [];
            }

            // Get results
            var insn = Module.getValue(insn_ptr, '*');
            var size = Module.getValue(size_ptr, 'i32');
            var count = Module.getValue(count_ptr, 'i32');

            var mc = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                mc[i] = Module.getValue(insn + i, 'i8');
            }
            
            // Free memory and return buffer
            var ret = Module.ccall('ks_free', 'void', ['pointer'], insn_ptr);
            Module._free(buffer_ptr);
            Module._free(insn_ptr);
            Module._free(size_ptr);
            Module._free(count_ptr);
            return mc
        };

        // Constructor
        var ret = Module.ccall('ks_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );

        if (ret != ks.ERR_OK) {
            Module.setValue(this.handle_ptr, 0, '*');
            console.error('Keystone.js: Function ks_open failed with code %d.', ret);
        }
    },
};
