// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // 每行允许多条语句（规则在 @stylistic 下）
    '@stylistic/max-statements-per-line': 'off',
    // 文件末尾不强制换行
    '@stylistic/eol-last': 'off',
    // 其他代码风格放宽
    '@stylistic/no-multi-spaces': 'off',
    '@stylistic/comma-dangle': 'off',
    '@stylistic/arrow-parens': 'off',
    '@stylistic/member-delimiter-style': 'off',
    // Vue 模板格式规则放宽
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-quotes': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/attributes-order': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/operator-linebreak': 'off',
    // ref 可直接在模板中使用（Vue 自动解包）
    'vue/no-ref-as-operand': 'off',
    // TypeScript：允许 any、未使用变量等，仅作提示
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'warn'
  },
})
