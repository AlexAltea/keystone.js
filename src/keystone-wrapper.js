/**
 * (c) 2016-2026 Keystone.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

Object.assign(Module, {
    // ks_err
    ERR_OK: 0,
    ERR_NOMEM: 1,
    ERR_ARCH: 2,
    ERR_HANDLE: 3,
    ERR_MODE: 4,
    ERR_VERSION: 5,
    ERR_OPT_INVALID: 6,
    ERR_ASM: 128,
    ERR_ASM_EXPR_TOKEN: 128,
    ERR_ASM_DIRECTIVE_VALUE_RANGE: 129,
    ERR_ASM_DIRECTIVE_ID: 130,
    ERR_ASM_DIRECTIVE_TOKEN: 131,
    ERR_ASM_DIRECTIVE_STR: 132,
    ERR_ASM_DIRECTIVE_COMMA: 133,
    ERR_ASM_DIRECTIVE_RELOC_NAME: 134,
    ERR_ASM_DIRECTIVE_RELOC_TOKEN: 135,
    ERR_ASM_DIRECTIVE_FPOINT: 136,
    ERR_ASM_DIRECTIVE_UNKNOWN: 137,
    ERR_ASM_DIRECTIVE_EQU: 138,
    ERR_ASM_DIRECTIVE_INVALID: 139,
    ERR_ASM_VARIANT_INVALID: 140,
    ERR_ASM_EXPR_BRACKET: 141,
    ERR_ASM_SYMBOL_MODIFIER: 142,
    ERR_ASM_SYMBOL_REDEFINED: 143,
    ERR_ASM_SYMBOL_MISSING: 144,
    ERR_ASM_RPAREN: 145,
    ERR_ASM_STAT_TOKEN: 146,
    ERR_ASM_UNSUPPORTED: 147,
    ERR_ASM_MACRO_TOKEN: 148,
    ERR_ASM_MACRO_PAREN: 149,
    ERR_ASM_MACRO_EQU: 150,
    ERR_ASM_MACRO_ARGS: 151,
    ERR_ASM_MACRO_LEVELS_EXCEED: 152,
    ERR_ASM_MACRO_STR: 153,
    ERR_ASM_MACRO_INVALID: 154,
    ERR_ASM_ESC_BACKSLASH: 155,
    ERR_ASM_ESC_OCTAL: 156,
    ERR_ASM_ESC_SEQUENCE: 157,
    ERR_ASM_ESC_STR: 158,
    ERR_ASM_TOKEN_INVALID: 159,
    ERR_ASM_INSN_UNSUPPORTED: 160,
    ERR_ASM_FIXUP_INVALID: 161,
    ERR_ASM_LABEL_INVALID: 162,
    ERR_ASM_FRAGMENT_INVALID: 163,
    ERR_ASM_ARCH: 512,
    ERR_ASM_INVALIDOPERAND: 512,
    ERR_ASM_MISSINGFEATURE: 513,
    ERR_ASM_MNEMONICFAIL: 514,

    // ks_arch
    ARCH_ARM: 1,
    ARCH_ARM64: 2,
    ARCH_MIPS: 3,
    ARCH_X86: 4,
    ARCH_PPC: 5,
    ARCH_SPARC: 6,
    ARCH_SYSTEMZ: 7,
    ARCH_HEXAGON: 8,
    ARCH_EVM: 9,
    ARCH_MAX: 10,

    // ks_mode
    MODE_LITTLE_ENDIAN: 0,
    MODE_BIG_ENDIAN: 1 << 30,
    MODE_ARM: 1 << 0,
    MODE_THUMB: 1 << 4,
    MODE_V8: 1 << 6,
    MODE_MICRO: 1 << 4,
    MODE_MIPS3: 1 << 5,
    MODE_MIPS32R6: 1 << 6,
    MODE_MIPS32: 1 << 2,
    MODE_MIPS64: 1 << 3,
    MODE_16: 1 << 1,
    MODE_32: 1 << 2,
    MODE_64: 1 << 3,
    MODE_PPC32: 1 << 2,
    MODE_PPC64: 1 << 3,
    MODE_QPX: 1 << 4,
    MODE_SPARC32: 1 << 2,
    MODE_SPARC64: 1 << 3,
    MODE_V9: 1 << 4,

    // ks_opt_type
    OPT_SYNTAX: 1,

    // ks_opt_value
    OPT_SYNTAX_INTEL: 1 << 0,
    OPT_SYNTAX_ATT: 1 << 1,
    OPT_SYNTAX_NASM: 1 << 2,
    OPT_SYNTAX_MASM: 1 << 3,
    OPT_SYNTAX_GAS: 1 << 4,

    // ks_version
    API_MAJOR: 0,
    API_MINOR: 9,

    version: function() {
        var major_ptr = Module._malloc(4);
        var minor_ptr = Module._malloc(4);
        var ret = Module.ccall('ks_version', 'number',
            ['pointer', 'pointer'], [major_ptr, minor_ptr]);
        Module._free(major_ptr);
        Module._free(minor_ptr);
        return ret;
    },

    arch_supported: function(arch) {
        var ret = Module.ccall('ks_arch_supported', 'number', ['number'], [arch]);
        return ret;
    },

    strerror: function(code) {
        var ret = Module.ccall('ks_strerror', 'string', ['number'], [code]);
        return ret;
    },

    /**
     * Keystone object
     */
    Keystone: function (arch, mode) {
        this.arch = arch;
        this.mode = mode;
        this.handle_ptr = Module._malloc(4);

        // Options
        this.option = function(option, value) {
            var handle = Module.getValue(this.handle_ptr, '*');
            if (!handle) {
                return;
            }
            var ret = Module.ccall('ks_option', 'number',
                ['pointer', 'number', 'number'],
                [handle, option, value]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Keystone.js: Function ks_option failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        // Assembler
        this.asm = function (assembly, address) {
            var handle = Module.getValue(this.handle_ptr, '*');
            if (!handle) {
                return { mc: new Uint8Array(0), count: 0, failed: true };
            }

            // Output parameters: encoding buffer, its size and the statement count
            var encoding_ptr = Module._malloc(4);
            var size_ptr = Module._malloc(4);
            var count_ptr = Module._malloc(4);

            // Run the assembler. The address is a 64-bit value, passed as a BigInt
            // thanks to WASM_BIGINT. The assembly string is marshalled by ccall.
            var ret = Module.ccall('ks_asm', 'number',
                ['pointer', 'string', 'number', 'pointer', 'pointer', 'pointer'],
                [handle, assembly, BigInt(address || 0), encoding_ptr, size_ptr, count_ptr]
            );

            // Dereference results (pointers and sizes are 32-bit under wasm32)
            var encoding = Module.getValue(encoding_ptr, 'i32');
            var size = Module.getValue(size_ptr, 'i32');
            var count = Module.getValue(count_ptr, 'i32');
            var asm = {
                mc: new Uint8Array(size),
                count: count,
                failed: Boolean(ret),
            };
            for (var i = 0; i < size; i++) {
                asm.mc[i] = Module.getValue(encoding + i, 'i8');
            }

            // Free the Keystone-allocated buffer and the output parameters
            Module.ccall('ks_free', 'void', ['pointer'], [encoding]);
            Module._free(encoding_ptr);
            Module._free(size_ptr);
            Module._free(count_ptr);
            return asm;
        };

        this.errno = function() {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('ks_errno', 'number', ['pointer'], [handle]);
            return ret;
        }

        this.close = function() {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('ks_close', 'number', ['pointer'], [handle]);
            if (ret != Module.ERR_OK) {
                var error = 'Keystone.js: Function ks_close failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            Module._free(this.handle_ptr);
        }

        // Constructor
        var ret = Module.ccall('ks_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );

        if (ret != Module.ERR_OK) {
            Module.setValue(this.handle_ptr, 0, '*');
            var error = 'Keystone.js: Function ks_open failed with code ' + ret + ':\n' + Module.strerror(ret);
            throw error;
        }
    },
});
