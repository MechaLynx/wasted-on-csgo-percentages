// ==UserScript==
// @name        wasted-on-csgo-percentage
// @namespace   mechalynx/wasted-on-csgo-percentages
// @description Shows percentages and allows sorting on wasted-on-csgo.com
// @include     http://wasted-on-csgo.com/steamid/*
// @version     0.0.2
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/tablesort/5.0.0/tablesort.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/tablesort/5.0.0/src/sorts/tablesort.number.js
// ==/UserScript==

var table = document.getElementsByClassName('table--default')[0];

var normalize_number_to_minutes = function(num){
    var hours = get_int(num, "h");
    var minutes = get_int(num, "m");
    return Number(hours)*60 + Number(minutes);
};

var get_int = function(str, hint){
    var s = new RegExp('([0-9]*)' + hint, "m");

    var out = str.match(s);

    if (out !== null) {
        return out[1];
    } else {
        return 0;
    }
};

var get_int_from_str = function(str){
    var hrs = get_int(str, "h");
    var mins = get_int(str, "m");

    return Number(hrs)*60 + Number(mins);
};

var calc_percentage = function(shots, hits){
    var shots_in_minutes = normalize_number_to_minutes(shots);
    var hits_in_minutes = normalize_number_to_minutes(hits);

    var total = hits_in_minutes + shots_in_minutes;

    return Math.floor((hits_in_minutes / total) * 100);
};

var convert_table_to_int = function(){
    for (i=1, row; row=table.rows[i]; i++){
       row.children[1].textContent = get_int_from_str(row.children[1].textContent);
       row.children[2].textContent = get_int_from_str(row.children[2].textContent);
       row.children[3].textContent = row.children[3].textContent.match(/([0-9]*) %/m)[1];
    }
    return;
};

var get_str = function(s){
    var hrs = Math.floor(Number(s) / 60);
    var mins = Number(s) % 60;

    var retstr = "";

    if ( Number(hrs) >= 1 ){
        retstr += Number(hrs) + "h";
    }
    if ( Number(mins) !== 0 ){
        if ( retstr !== ""){
            retstr += " ";
        }
        retstr += Math.floor(mins) + "m";
    }

    return retstr;
};

var convert_table_to_strings = function(){
    for (i=1, row; row=table.rows[i]; i++){
       row.children[1].textContent = get_str(row.children[1].textContent);
       row.children[2].textContent = get_str(row.children[2].textContent);
       row.children[3].textContent = row.children[3].textContent + " %";
    }
    return;
};

for (var i=0, row; row = table.rows[i]; i++) {
    if (row.children[0].tagName == 'TH' ){
        var clone = row.children[0].cloneNode(true);
        row.appendChild(clone);
        clone.textContent= "hits / total";

        row.setAttribute('data-sort-method', 'none');

        for (var j=1; j < 4; j++){
            row.children[j].setAttribute('data-sort-method', 'number');
        }
    } else {
        clone = row.children[0].cloneNode(true);
        row.appendChild(clone);
        var shots = row.children[1].textContent;
        var hits = row.children[2].textContent;
        var perc = calc_percentage(shots, hits);
        clone.textContent = perc + ' %';
    }
}

table.rows[table.rows.length - 1].setAttribute('data-sort-method', 'none');

var sort = new Tablesort(table);

table.addEventListener('beforeSort', convert_table_to_int);
table.addEventListener('afterSort', convert_table_to_strings);
