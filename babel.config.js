module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
    ["@babel/plugin-transform-flow-strip-types"],
    ["@babel/plugin-transform-class-properties"],
    ["@babel/plugin-transform-class-static-block"],
  ],
};
