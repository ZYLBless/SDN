//id of button: addblack deleteblack
//id of input:ip_black
//id of textarea: ipblacklist

var flag = true;
var ip_blacklist = Array();
$(document).ready(function () {
    $("#addblack").click(function () {
        var ip_black = document.getElementById('ip_black').value;
        console.log('add');
        console.log(ip_black);

        var add_black = {
            "dpid": "0000000000000001",
            "match": { 'eth_type': 0x0800, 'nw_src': ip_black, 'nw_dst': '10.0.0.5' },
            "priority": "2",
            "actions": [{ "type": "DROP" }]
        }
        var add = false;
        $.ajax({
            type: 'POST',
            url: "http://127.0.0.1:8080/stats/flowentry/add",
            data: JSON.stringify(add_black),
            success: add = true,
            dataType: JSON
        });
        console.log(add);
        if (add && ip_blacklist.length>0) {
            var f = true;
            var temp_list='';
            ip_blacklist.forEach(function (d) {
                //temp_list=temp_list+d+"<br/>";
                if (d != ip_black){ temp_list=temp_list+d+"\r\n";}
                else{f=false;}
            })
            if (f) {
                ip_blacklist.push(ip_black);
                temp_list=temp_list+ip_black;
                changeblacklist(temp_list);
                alert("add successfully");
            }
        }
        if(ip_blacklist.length==0 && add)
        {
            ip_blacklist.push(ip_black);
            changeblacklist(ip_blacklist);
        }
    });
    $("#deleteblack").click(function () {
        var ip_black = document.getElementById('ip_black').value;
        console.log('delete');
        var del = false;
        var delete_black = {
            "dpid": "0000000000000001",
            "match": { 'eth_type': 0x0800, 'nw_src': ip_black, 'nw_dst': '10.0.0.5' },
            "priority": "2",
            "actions": [{ "type": "DROP" }]
        }
        $.ajax({
            type: 'POST',
            url: "http://127.0.0.1:8080/stats/flowentry/delete",
            data: JSON.stringify(delete_black),
            success: del = true,
            dataType: JSON
        });
        
        if (del) {
            var f = false;
            var temp_list='';
            var temp_black=Array();
            ip_blacklist.forEach(function (d) {
                //temp_list=temp_list+d+<br/>;
                if (d != ip_black){
                    temp_black.push(d); 
                    temp_list=temp_list+d+"\r\n";
                }
                else{f=true;}
            })
            if (f) {
                ip_blacklist=temp_black;
                changeblacklist(temp_list);
                alert("delete successfully");
            }
            else{alert("this ip is not in black list");}
        }

    });
});

function OnFocusFun(element, elementvalue) {
    if (element.value == elementvalue) {
        element.value = "";
        //element.style.color="#000";
    }
}
//离开输入框时触发事件
function OnBlurFun(element, elementvalue) {
    if (element.value == "" || element.value.replace(/\s/g, "") == "") {
        element.value = elementvalue;
        //element.style.color="#999";
    }
}

function changeblacklist(iplist) {
    console.log(iplist);
    document.getElementById("ipblacklist").innerHTML = iplist;
}
