let deviceTimerRef = null;
let token = ""

function getDevices( evt, data ){
    var hardware ='r3l';
    var apiDevicesGet = `/cgi-bin/luci/;stok=${token}/api/misystem/devicelist`,
        apiDevicesGetData = {},
        macLocal,
        tplItem = $( '#tmpldevicesitem' ).html(),
        tplWaper = $('#tmpldeviceswrap').html(),
        wraper = $('#devicesTables'),
        devices,
        deviceslistHtml = [],
        listHtml = {
            '0': [],
            '1': [],
            '2': [],
            '3': []
        },
        hasDisk = G_FEATURES['hardware']['disk'] === '1',
        isWifi5G = G_FEATURES['wifi']['wifi50'] === '1';

    $.getJSON( apiDevicesGet, apiDevicesGetData, function( rsp ){
        if ( rsp.code === 0 ) {
            devices = rsp.list;
            macLocal = rsp.mac.toUpperCase();
            if ( devices.length > 0 ) {
                for ( var i = 0 ; i < devices.length ; i++ ) {
                    var d_mac, d_self, d_ip, d_type, d_option, d_signal_level, d_action, d_action2, d_online, d_download, d_dld_speed, d_wan, d_lan, type_html, type_detail, d_html, d_activets,
                        d_devices_icon = '/img/device_list_unknow.png',
                        // 0/1/2/3  有线 / 2.4G wifi / 5G wifi / guest wifi
                        d_type_id,
                        d_name,
                        d_origin_name,
                        d_upload,
                        d_uld_speed;

                    d_mac = devices[i].mac.toUpperCase();

                    if( $.isArray(devices[i].ip) ){
                        d_ip = $(devices[i].ip).map(function(){
                            console.log(this);
                            return this.ip;
                        }).get();
                    } else {
                        d_ip = [];
                    }

                    d_type_id = devices[i].type;
                    d_name = devices[i].name;
                    d_origin_name = devices[i].oname;

                    d_wan = devices[i].authority.wan;
                    d_lan = devices[i].authority.lan;

                    if ( devices[i].statistics ) {
                        d_online = devices[i].statistics.online;
                        d_download = devices[i].statistics.download;
                        d_dld_speed = devices[i].statistics.downspeed;
                        d_upload = devices[i].statistics.upload;
                        d_uld_speed = devices[i].statistics.upspeed;
                    }
                    if ( devices[i].icon && devices[i].icon !== "") {
                        d_devices_icon = '/cn/' + devices[i].icon;
                    }

                    if ( macLocal == d_mac ) {
                        d_self = true;
                    } else {
                        d_self = false;
                    }
                    //终端操作
                    var tplDevAction = '<a data-self="{$d_self}" data-mac="{$d_mac}" data-type="{$d_type}" href="#" class="btn-switch btn-switch-{$status} {$cls}"></a>';
                    if ( d_wan == 0 ) {
                        d_action = tplDevAction.tmpl({
                            'd_self': d_self ? '1':'0',
                            'd_mac': d_mac,
                            'd_type': 'wan',
                            'cls': 'act-add-back',
                            'status': 'off'
                        });
                    } else {
                        d_action = tplDevAction.tmpl({
                            'd_self': d_self ? '1':'0',
                            'd_mac': d_mac,
                            'd_type': 'wan',
                            'cls': 'act-kick-out',
                            'status': 'on'
                        });
                    }
                    if ( d_lan == 0 ) {
                         d_action2 = tplDevAction.tmpl({
                            'd_self': d_self ? '1':'0',
                            'd_mac': d_mac,
                            'd_type': 'lan',
                            'cls': 'act-add-back',
                            'status': 'off'
                        });
                    } else {
                        d_action2 = tplDevAction.tmpl({
                            'd_self': d_self ? '1':'0',
                            'd_mac': d_mac,
                            'd_type': 'lan',
                            'cls': 'act-kick-out',
                            'status': 'on'
                        });
                    }
                    if ( d_type_id == 3 ) {
                        d_action2 = '';
                    }
                    d_html = tplItem.tmpl( {
                        'name' : StringH.encode4HtmlValue(d_name),
                        'origin_name' : d_origin_name,
                        'mac' : d_mac,
                        'devices_icon' : d_devices_icon,
                        'download' : byteFormat(d_download, 100),
                        'speed' : byteFormat(d_dld_speed, 100),
                        'online' : $.secondToDate(d_online),
                        'option' : d_action,
                        'option2' : d_action2,
                        'ip': d_ip,
                        'isself': d_self,
                        'hasDisk': hasDisk,
                        'upload': byteFormat(d_upload, 100),
                        'upspeed': byteFormat(d_uld_speed, 100)
                    } );

                    listHtml[d_type_id].push( d_html );
                }

                var containerList = [],
                    containerTitle = ['Ethernet connected devices','Connected devices','Connected devices','Connected devices'];
                if (!isWifi5G) {
                    containerTitle = ['Ethernet connected devices','Wi-Fi networking devices','Connected devices','Connected devices'];
                }
                for (var key in listHtml) {
                    var devlen = listHtml[key].length,
                        devtype = containerTitle[key];
                    if ( devlen > 0 ) {
                        containerList.push(
                            tplWaper.tmpl({
                                devlen: devlen,
                                devtype: devtype,
                                deviceslist: listHtml[key].join(''),
                                hasDisk: hasDisk
                            })
                        );
                    } else {
                        if ( key == 2 && isWifi5G) {
                            containerList.push(
                                tplWaper.tmpl({
                                    devlen: devlen,
                                    devtype: devtype,
                                    deviceslist: $('#tmpldevices5gempty').html(),
                                    hasDisk: hasDisk
                                })
                            );
                        }
                    }
                }
                wraper.html( containerList.join('') );
            }
        }
    } );
}

function debug(){
    var elem = document.createElement("div");
    elem.style.position = "fixed";
    elem.style.top = 0;
    elem.style.right = 0;
    elem.style.color = 'red';
    elem.innerHTML = "Injected";
    document.body.append(elem);
}

function changeTemplate(){
    document.getElementById("tmpldevicesitem").innerHTML = `
    <tr class="device-item">
        <td>
            <img class="dev-icon" width="60" src="{$devices_icon}" onerror="this.src='/img/device_list_err.png'">
            <div class="dev-info">
                <ul class="devnetinfo clearfix" style="margin-bottom: 10px">
                    <li><div class="name" style="padding: 0">{$name} &nbsp;&nbsp;{if($isself)}<span class="muted">|&nbsp;Current device</span>{/if}</div></li>
                    <li>
                        <span><i style="display: inline-block;width: 15px;height: 10px;background: url(http://${window.location.hostname}/xiaoqiang/web/img/ico_updown.png) no-repeat;background-position: 0 0;"></i>{$upspeed}<span>
                        <span style="margin-left: 10px"><i style="display: inline-block;width: 15px;height: 10px;background: url(http://${window.location.hostname}/xiaoqiang/web/img/ico_updown.png) no-repeat;background-position: 0 -21px;"></i>{$speed}</span>
                    </li>
                </ul>
                <ul class="devnetinfo clearfix">
                    <li><span class="k">Connected:</span> <span class="v">{$online}</span></li>
                    <li>
                        {for(var i=0, len=$ip.length; i<len; i++)}
                        <p><span class="k">IP address:</span> <span class="v">{$ip[i]}</span></p>
                        {/for}
                    </li>
                    <li><span class="k">MAC address:</span> <span class="v">{$mac}</span></li>
                </ul>
            </div>
        </td>
        <td class="option">
            {$option}
        </td>
        {if($hasDisk)}
        <td class="option">
            {$option2}
        </td>
        {/if}
    </tr>
    `;
}

function runDeviceReresh() {
    const timerRef2 = setTimeout(function () {
        deviceTimerRef = setInterval(function() {
            getDevices();
        }, 5000);
        clearTimeout(timerRef2);
    }, 5000);
}

const timerRef = window.setInterval(function(){
    if(document.getElementById("tmpldevicesitem")){
        token = window.location.href.split(";")[1].split("=")[1].split("/")[0];
        changeTemplate();
        clearInterval(timerRef);
        runDeviceReresh();
    }
}, 100);

setInterval(function () {
    $.pub("netdiagnosis")
}, 10000);