// tsdown.config.ts
import {defineConfig} from 'tsdown';

export default defineConfig({
    entry: 'lib/Tabletojson.ts',
    // Other options
    format: ['esm', 'cjs']
});
