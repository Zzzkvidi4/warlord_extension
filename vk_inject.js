
function isProfile(){
    var profile_div = document.getElementById('profile');
    return profile_div !== null;
}

function addWarlordInfo(){
    var doc  = document.getElementById('warlord_justifier');
    if (isProfile() && (doc === null)){
        var profile_full = document.getElementById('page_info_wrap');
        var link = '<a id="warlord_clicker" class="profile_more_info_link" onclick="toggleWarlord(this)"><span class="profile_label_more" id="show_span">WARLORD script by [KCW]</span><span class="profile_label_less" id="hide_span" style="display:none">WARLORD script by [KCW]</span></a>';
        profile_full.innerHTML += link + 
        '<div class="profile_info" id="warlord_justifier" style="display:none">' +
            '<div id="warlord_block">' +
                '<img id="warlord_loader" src="' + chrome.runtime.getURL('assets/img/loader.gif') +'">' +
            '</div>' +
        '</div>';
        chrome.storage.local.get('server_address', loadInfo);
    }
}

function createInfoRow(parent, label, inner_text){
    parent.innerHTML += '<div class="clear_fix profile_info_row"><div class="label fl_l">' + label + '</div><div class="labeled">' + inner_text + '</div></div>';
}

function createProofLink(link, number){
    return '<a  target="_blank" href=' + link.url + '>Доказательство ' + number + '</a>';
}

function createProofLinks(links){
    var links_str = '';
    links.forEach(function(link, i, links){
        if (links_str == ''){
            links_str = createProofLink(link, i + 1);
        }
        else
        {
            links_str = links_str + ', ' + createProofLink(link, i + 1);
        }
    });
    return links_str;
}

function createProofList(parent, proofs, statuses){
    for(key in proofs){
        if (key in statuses) {
            createInfoRow(parent, statuses[key].caption + ':', createProofLinks(proofs[key]));
        }
    };
}

function getWarlordInfo(server_address, user_id){
    chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: 'http://' + server_address + '/profiles/' + user_id
    }, function(responseText) {
        var loader = document.getElementById('warlord_loader');
        loader.style.display = 'none';
        var warlord_justifier_main_block = document.getElementById('warlord_block');
        try {
            var server_response = JSON.parse(responseText);
            if ((responseText != null) && (server_response != null)) {
                if ('error' in server_response) {
                    //warlord_justifier.innerHTML += '<div class="profile_info"><div class="clear_fix profile_info_row"><div class="label fl_l">Тип:</div><div class="labeled"><span>Непроверенный пользователь</span></div></div>';
                    if (server_response.error == 'unknown_profile') {
                        warlord_justifier_main_block.innerHTML = '';
                        createInfoRow(warlord_justifier_main_block, 'Статус:', '<span>Неизвестный пользователь</span>');                    }
                }
                else {
                    //warlord_justifier.innerHTML += '<div class="profile_info"><div class="clear_fix profile_info_row"><div class="label fl_l">Тип:</div><div class="labeled"><span>' + server_response.id_status + '</span></div></div>';
                    warlord_justifier_main_block.innerHTML = '';
                    createInfoRow(warlord_justifier_main_block, 'Статус:', '<img width="64" height="64" title="' + server_response.statuses[server_response.profiles[0].id_status].caption + '" src="' + server_response.statuses[server_response.profiles[0].id_status].image_url + '">');
                    createProofList(warlord_justifier_main_block, server_response.profiles[0].proofs, server_response.statuses);
                }
            } else {
                console.log(responseText);
                console.log(server_response);
                console.log('internal server error');
                createInfoRow(warlord_justifier_main_block, 'Ошибка:', '<span>Произошла ошибка на сервере Warlord Justifier. Проверьте адрес или свяжитесь с администрацией.</span>');
            }
        } catch(err){
            console.log('internal server error');
            createInfoRow(warlord_justifier_main_block, 'Ошибка:', '<span>Произошла ошибка на сервере Warlord Justifier. Проверьте адрес или свяжитесь с администрацией.</span>');
        }
        createInfoRow(warlord_justifier_main_block, 'Группа:', '<a target="_blank" href="https://vk.com/justice_warlord"><span>Конституционный Суд WARLORD [KCW]</span></a>');
        createInfoRow(warlord_justifier_main_block, 'Благодарности:', '<a target="_blank" href="https://vk.com/topic-133931816_34920946"><span>Спонсоры</span></span></a>');
    });
}

function getVKUserInfo(server_address, user_id){
    var xhr = new XHR();
    xhr.open('GET', 'https://api.vk.com/method/users.get?user_ids=' + user_id + '&v=5.62');

    xhr.onload = function() {
        var server_response = JSON.parse(this.responseText);
        if ((server_response !== undefined) && (this.responseText !== undefined)) {
            user_id_str = server_response.response[0].id;
            getWarlordInfo(server_address, user_id_str);
        } else {
            var loader = document.getElementById('warlord_loader');
            loader.style.display = 'none';
            var warlord_justifier_main_block = document.getElementById('warlord_block');
            createInfoRow(warlord_justifier_main_block, 'Ошибка:', '<span>Произошла ошибка на сервере VK. Проверьте подключение к интернету или свяжитесь с администрацией.</span>');
        }
    };

    xhr.onerror = function(){
        var loader = document.getElementById('warlord_loader');
        loader.style.display = 'none';
        console.log('Error while accept to vk api: ' + this.status);
        var warlord_justifier_main_block = document.getElementById('warlord_block');
        createInfoRow(warlord_justifier_main_block, 'Ошибка:', '<span>Произошла ошибка на сервере VK. Проверьте подключение к интернету или свяжитесь с администрацией.</span>');
    };
    xhr.send();
}

function loadInfo(items){
    var user_id = window.location.href;
    var user_id_str = user_id.substr(user_id.lastIndexOf('/') + 1);
    var server_address = items.server_address;
    if ((server_address === undefined) || (server_address === null))
    {
        server_address = 'warlord-justifier.herokuapp.com';
    }
    /*if ((user_id_str.indexOf('id') == 0) && (Number(user_id_str.substr(2)) != 0))
    {
        user_id_str = user_id_str.substr(2);
        getWarlordInfo(server_address, user_id_str);
    }
    else
    {
        getVKUserInfo(server_address, user_id_str);
    }*/
    getVKUserInfo(server_address, user_id_str);
}

var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

var s = document.createElement('script');
s.src = chrome.extension.getURL('utils.js');
s.onload = function() {
    this.remove();
};
document.head.appendChild(s);

addWarlordInfo();
var focusedOn = document.body;
var pageObserver = new MutationObserver(addWarlordInfo);
pageObserver.observe(focusedOn, {characterData: false, childList: true, subtree: true});
