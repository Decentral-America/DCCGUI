# DCCGUI Development Standards

## Project Overview

**DecentralChain Wallet GUI** - AngularJS 1.x based cryptocurrency wallet application
- **Technology Stack**: AngularJS 1.x, TypeScript, Gulp, Electron, Node.js
- **Architecture**: Multi-environment (mainnet/stagenet/testnet), modular structure
- **Build System**: Gulp-based with Babel transpilation and concatenation

## Critical Build System Rules

### Babel Polyfill Management
- **MUST** include babel-polyfill entry in any bundle containing async/await code
- **ALWAYS** add `require('babel-polyfill')` at the top of entry files when using ES2015+ features
- **NEVER** use async/await without ensuring regeneratorRuntime is available
- Babel configuration in `/scripts/babelTask.ts` handles transpilation but NOT polyfill injection

### Dependency Integration Process
1. **Add to package.json** dependencies
2. **Update vendors/require-modules.js** MODULES_MAP for browser access
3. **Test in all environments** (development/production × mainnet/stagenet/testnet)
4. **Verify module loading order** - ensure dependencies load before dependents

### Hardware Wallet Dependencies
- **@ledgerhq/** packages require complete ecosystem installation
- **MUST** install all related @ledgerhq packages when adding hardware wallet support
- **ALWAYS** update require-modules.js mapping for @ledgerhq modules
- **CHECK** deprecated warnings for @ledgerhq/hw-transport-u2f (migrate to webusb/webhid)

## Multi-Environment Configuration

### Environment Structure
```
/configs/
├── mainnet.json    - Production blockchain
├── stagenet.json   - Staging blockchain  
├── testnet.json    - Test blockchain
```

### Build Commands
- `npm run server` - Shows environment selection menu
- Build targets: `web`|`desktop` × `development`|`production` × `mainnet`|`stagenet`|`testnet`

### Adding New Environment
1. **Create config file** in `/configs/` following existing structure
2. **Update gulpfile.ts** config choices if needed
3. **Test all platform/environment combinations**

## AngularJS Module Standards

### Module Structure
```
/src/modules/
├── app/           - Core application modules
├── utils/         - Utility services
├── welcome/       - Welcome/onboarding
└── dex/          - DEX trading functionality
```

### Adding New Modules
1. **Create module directory** under appropriate category
2. **Follow naming pattern**: PascalCase for services, camelCase for controllers
3. **Add module dependencies** to parent module
4. **Update build tasks** if adding new module categories

### Service Integration
- **ALWAYS** inject dependencies through AngularJS DI system
- **NEVER** use global variables except for pre-defined window objects
- **USE** factory pattern for services with complex initialization

## Internationalization Standards

### Locale Management
```
/locale/
├── en/           - English (primary)
├── ru/           - Russian
├── zh_CN/        - Chinese Simplified
└── [other]/      - Additional languages
```

### Adding New Language
1. **Create language directory** following ISO codes
2. **Copy all JSON files** from `/locale/en/`
3. **Translate all key-value pairs** maintaining JSON structure
4. **Test i18next loading** in all environments
5. **NEVER** modify key names - only translate values

### i18next Configuration
- **Project ID required** for i18next-locize-backend
- **ALWAYS** provide fallback translations for missing keys
- **CHECK** namespace loading in AppConfig.js

## File Modification Coordination

### Simultaneous Updates Required

#### Package Dependencies
When modifying **package.json**:
- **UPDATE** package-lock.json via `npm install`
- **CHECK** vendors/require-modules.js for new module mappings
- **VERIFY** all build environments still work

#### Build Configuration
When modifying **gulpfile.ts** or `/scripts/`:
- **TEST** all build targets (6 combinations)
- **VERIFY** dist output structure remains consistent
- **CHECK** electron packaging still works

#### AngularJS Modules
When adding modules to **src/modules/**:
- **UPDATE** parent module dependencies
- **ADD** to appropriate build tasks
- **TEST** module loading order

#### Electron Integration
When modifying **electron/**:
- **UPDATE** main.ts and preload.ts simultaneously
- **CHECK** bridge communication remains functional
- **VERIFY** desktop builds work

## Prohibited Actions

### Build System
- **NEVER** modify Babel presets without testing all environments
- **NEVER** remove babel-polyfill without removing all async/await usage
- **NEVER** change gulp task order without understanding dependencies
- **NEVER** modify require-modules.js without corresponding package.json changes

### Dependencies
- **NEVER** add @ledgerhq packages without installing complete ecosystem
- **NEVER** update major versions without extensive testing
- **NEVER** remove dependencies without checking all usage locations
- **NEVER** use ES2015+ features without ensuring Babel support

### Code Standards
- **NEVER** use global variables except through require-modules.js mapping
- **NEVER** import ES6 modules directly in AngularJS - use require()
- **NEVER** modify network configurations without understanding blockchain implications
- **NEVER** commit dist/ or node_modules/ directories

## Emergency Recovery

### Common Issues Resolution

#### regeneratorRuntime undefined
1. **CHECK** babel-polyfill is included in bundle entry
2. **VERIFY** Babel plugins include 'transform-async-to-generator'
3. **ADD** explicit polyfill import if missing

#### Module not found errors
1. **CHECK** package.json has dependency
2. **VERIFY** require-modules.js has mapping
3. **ENSURE** module loading order is correct

#### Angular undefined errors
1. **CHECK** script loading order in HTML
2. **VERIFY** AngularJS loads before application modules
3. **ENSURE** concatenation order in gulp tasks

#### Build failures
1. **RUN** `npm run build` to check TypeScript compilation
2. **CHECK** gulp task dependencies
3. **VERIFY** all required files exist

## AI Decision-Making Guidelines

### Priority Order for Fixes
1. **Critical Runtime Errors** (regeneratorRuntime, module not found)
2. **Build System Failures** (gulp tasks, TypeScript compilation)
3. **Development Environment Issues** (server startup, hot reload)
4. **Feature Additions** (new modules, integrations)

### When Adding Dependencies
1. **RESEARCH** complete dependency tree
2. **TEST** in isolated environment first
3. **UPDATE** all related configuration files
4. **VERIFY** all build targets work

### When Modifying Core Files
1. **BACKUP** original configuration
2. **TEST** incremental changes
3. **VERIFY** all environments function
4. **DOCUMENT** changes made
