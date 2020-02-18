;/*! maastr 1.0 (c) 2020 Andreas May */
(function(){
  'use strict';

  this.maastr = { };

  this.maastr.default = {
    tokens: {
      '**': 'bold',
      '__': 'underline',
      '~~': 'strikethrough',
      '*': 'italic'
    },
    settings: {
      htmlTag: 'span',
      prefix: '',
      suffix: '',
    }
  };

  /**
   * Parses strings with the provided tokens object or the default tokens if none are specified
   * @param {string} string The string to parse
   * @param {{[key: string]: string}?} tokens The tokens
   * @param {{[key: string]: string}?} settings The settings
   */
  this.maastr.parse = function(string, tokens = maastr.default.tokens, settings = maastr.default.settings) {
    let ntokens = {};
    for (let t in tokens) {
      if (typeof tokens[t] == 'string') ntokens[t]= [ tokens[t], false, false ];
      else ntokens[t] = [ tokens[t][0], !!tokens[t][1], !!tokens[t][2] ];
    }
    tokens = ntokens;

    let active = [ [] ];
    let lastChar = '';
    let splitted = string.split('');
    let out = '';
    let pos = 0;

    for (let i = 0; i < splitted.length; i++) {
      let char = splitted[i];
      let full = lastChar + char;
      if (full.length == 2 && tokens[full]) {
        out = out.substr(0, out.length - 1);
        tokens[full][2] = !tokens[full][2];
        lastChar = '';
        pos--;
      } else if (tokens[char] && !(i+1 < splitted.length && tokens[char + splitted[i+1]])) {
        tokens[char][2] = !tokens[char][2];
        lastChar = '';
      } else {
        out += char;
        lastChar = char;
        pos++;
      }
      active[pos] = [];
      for (let token of Object.values(tokens)) {
        if (token[2]) active[pos].push(token);
      }
    }

    string = out;
    out = '';

    if (Object.keys(active).length) {
      for (let i = 0; i < string.length; i++) {
        let bulk = [];
        let open = [];
        let close = 0;
        for (let token of active[i]) {
          if (token[1]) bulk.push(token[0]);
          else {
            if (i == 0 || !active[i-1].filter(o => o[0] == token[0]).length) {
              open.push(token[0]);
            } else if (i == string.length - 1 || !active[i+1].filter(o => o[0] == token[0]).length) {
              close++;
            }
          }
        }

        let add = string.split('')[i];

        if (bulk.length) {
          if (add == ' ') add = '&nbsp;';
          add = `<${settings.htmlTag || 'span'} class="${bulk.join(' ')}">${add}</${settings.htmlTag || 'span'}>`;
        }

        if (open.length) {
          for (let tag of open)
            add = `<${settings.htmlTag || 'span'} class="${tag}">${add}`;
        }

        if (close) {
          add += `</${settings.htmlTag || 'span'}>`.repeat(close);
        }

        out += add;
      }

      out = (settings.prefix || '') + out + (settings.suffix || '');
    }

    return out || string;
  }

  return this.maastr;
}).call(this);