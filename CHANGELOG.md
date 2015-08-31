# Changelog

## 1.0.1 - 2015.04.18.

- Refactored whole framework with some automated tests
- Added management to website - create and delete packages ([#126](https://github.com/Hacklone/private-bower/issues/126))
- Created new design ([#125](https://github.com/Hacklone/private-bower/issues/125))
- Added option to whitelist / blacklist packages ([#115](https://github.com/Hacklone/private-bower/issues/115))
- Added api for manually refresh repository caches ([#117](https://github.com/Hacklone/private-bower/issues/117))
- fixed git-daemon crashes ([#112](https://github.com/Hacklone/private-bower/issues/112))
- fixed confusing return codes ([#118](https://github.com/Hacklone/private-bower/issues/118))

## 1.1.0 - 2015.06.29.

- Added bower.json package details to web ui ([#109](https://github.com/Hacklone/private-bower/issues/109))
- Make private-bower closed network friendly ([#144](https://github.com/Hacklone/private-bower/issues/144))
- bug fix ([#148](https://github.com/Hacklone/private-bower/issues/148))

## 1.1.1 - 2015.07.26.

- Added help text to package detail errors ([#149](https://github.com/Hacklone/private-bower/issues/149))
- Added process.env.PORT and process.env.IP support ([#141](https://github.com/Hacklone/private-bower/issues/141))
- Added tip for API usage in README.md ([#154](https://github.com/Hacklone/private-bower/issues/154))
- Registering a public package for the first time, hit count fixed ([#157](https://github.com/Hacklone/private-bower/issues/157))

## 1.1.2 - 2015.08.09.

- Added configurable protocol to mirrored packages ([#161](https://github.com/Hacklone/private-bower/issues/161))
- Fixed error flow when git cloning fails ([#156](https://github.com/Hacklone/private-bower/issues/156))

## 1.1.4 - 2015.08.29.

- enable version consultation ([#168](https://github.com/Hacklone/private-bower/issues/168))
- Added stdout to log message in case util.exec() fails. ([#164](https://github.com/Hacklone/private-bower/issues/164))
- fixed JSON parse errors ([#170](https://github.com/Hacklone/private-bower/issues/170))
- never used utils.process.env.PORT ([#159](https://github.com/Hacklone/private-bower/issues/159))