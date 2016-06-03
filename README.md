Keystone.js
===========
[![Last Release](https://img.shields.io/badge/version-0.9-brightgreen.svg?style=flat)](https://github.com/AlexAltea/keystone.js/releases)

Port of the [Keystone](https://github.com/keystone-engine/keystone) assembler framework for JavaScript. Powered by [Emscripten](https://github.com/kripken/emscripten).

**Notes:** _Keystone_ is a lightweight multi-architecture assembler framework originally developed by Nguyen Anh Quynh et al. and released under a dual license GPLv2 and the possibility of its commercial usage. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT` and the files mentioned by the *License* section in `README.md` inside the *keystone* submodule in this repository.

## Installation
To install the Keystone.js install in your web application, include it with:
```
<script src="keystone.min.js"></script>
```
or installer through the Bower command:
```
bower install keystonejs
```

## Usage                                                      
```javascript
// TODO
```

## Building
To build the Keystone.js library, clone the *master* branch of this repository, and do the following:

1. Initialize the original Keystone submodule: `git submodule update --init`.

2. Install the development and client dependencies with: `npm install` and `bower install`.

3. Install the lastest [Python 2.x (64-bit)](https://www.python.org/downloads/), [CMake](http://www.cmake.org/download/) and the [Emscripten SDK](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Follow the respective instructions and make sure all environment variables are configured correctly. Under Windows [MinGW](http://www.mingw.org/) (specifically *mingw32-make*) is required.

4. Finally, build the source with: `grunt build`.
