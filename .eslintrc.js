module.exports = {
    "rules": {
        "indent": [
            2,
            4
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ]
    },
    "env": {
        "node": true,
        "browser": true
    },
    "globals": {
        "angular": true,
        "jQuery": true,
        "L": true,
        "_": true
    },
    "extends": "eslint:recommended"
};