import tailwindConfig from './tailwind.config';
import autoPrefixer from 'autoprefixer';
import tailwind from 'tailwindcss';

export default {
    plugins: [tailwind(tailwindConfig), autoPrefixer],
};

// export default {};

// module.exports = {
//   plugin: {
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// };
