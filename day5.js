const { values, toPairs, splitEvery, range } = require('ramda') // eslint-disable-line no-unused-vars

const input = require('fs').readFileSync(process.argv[2], { encoding: 'utf8' })

// const lineIsNotEmpty = line => line.length !== 0;
// const lines = input.split("\n").filter(lineIsNotEmpty);

const re = /aA|Aa|bB|Bb|cC|Cc|dD|Dd|eE|Ee|fF|Ff|gG|Gg|hH|Hh|iI|Ii|jJ|Jj|kK|Kk|lL|Ll|mM|Mm|nN|Nn|oO|Oo|pP|Pp|qQ|Qq|rR|Rr|sS|Ss|tT|Tt|uU|Uu|vV|Vv|wW|Ww|xX|Xx|yY|Yy|zZ|Zz/g

const collapse = input => {
  let s
  let newS = input.replace(/\s/g, '')
  do {
    s = newS
    newS = s.replace(re, '')
  } while (newS !== s)
  return s
}

const polymers = [/a|A/g, /b|B/g, /c|C/g, /d|D/g, /e|E/g, /f|F/g, /g|G/g, /h|H/g, /i|I/g, /j|J/g, /k|K/g, /l|L/g, /m|M/g, /n|N/g, /o|O/g, /p|P/g, /q|Q/g, /r|R/g, /s|S/g, /t|T/g, /u|U/g, /v|V/g, /w|W/g, /x|X/g, /y|Y/g, /z|Z/g]

polymers.forEach(polymer => {
  console.log(polymer, collapse(input.replace(polymer, '')).length)
})

console.log(collapse(input).length)
