module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/components': './src/components',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@/assets': './src/assets',
            '@/api': './src/api',
            '@/context': './src/context',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/utils': './src/utils',
            '@': './src',
          },
        },
      ],
      'expo-router/babel',
    ],
  };
}; 