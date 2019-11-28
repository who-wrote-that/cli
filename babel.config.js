const presets = [
    '@babel/typescript',
    [
        '@babel/env',
        {
            targets: {
                node: '10',
            },
            useBuiltIns: 'usage',
            corejs: 3,
        },
    ],
];

module.exports = { presets };
