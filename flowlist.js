//id of button: flow
//id of input: ip_source ip_target
//id ot textarea: id_route

var cannot_ping = true;
$(document).ready(function () {
    $("#flow").click(function () {
        var ip_source = document.getElementById('ip_source').value;
        var ip_target = document.getElementById('ip_target').value;
        var get_srchost = false;
        var get_dsthost = false;
        var show_route = Array();
        cannot_ping = true;
        console.log(ip_source);
        console.log(ip_target);

        $.get("http://127.0.0.1:8080/v1.0/topology/links", function (links, status) {
            console.log("links");
            $.get("http://127.0.0.1:8080/v1.0/topology/hosts", function (hosts, status) {
                console.log("hosts");
                var route = Array();
                var end_route;
                var end_toute_port;
                var route_port = Array();
                hosts.forEach(function (d_h) {
                    //O1(1)
                    console.log("O1(1)");
                    if (ip_source == d_h.ipv4[0]) {
                        get_srchost = true;
                        console.log("O1(2)");
                        //O1(2)
                        route[0] = d_h.mac;
                        route[1] = d_h.port.dpid;
                        route_port[0] = parseFloat(d_h.port.port_no);
                        var target_notget = true;
                        var route_num = 0;
                        while (target_notget) {
                            target_notget = false;
                            route_num = route_num + 1;
                            //O2
                            target_notget = get_flow(parseFloat(route[route_num]), d_h, ip_source, ip_target, route, route_port, route_num, links)
                        }
                    }
                    if (ip_target == d_h.ipv4[0]) {
                        get_dsthost = true;
                        end_route = d_h.port.dpid;
                        end_toute_port = parseFloat(d_h.port.port_no);
                    }
                })
                //output route in console
                if (get_srchost && get_dsthost) {
                    var judge_route = route.pop();
                    var judge_route_port = route_port.pop();
                    console.log(judge_route);
                    console.log(end_route);
                    console.log(judge_route_port);
                    console.log(end_toute_port);
                    if (judge_route == end_route && judge_route_port == end_toute_port) {
                    route.push(end_route);
                    route_port.push(end_toute_port);
                    console.log(ip_source);
                    route.forEach(function (d) {
                        console.log("S:" + d);
                        show_route.push(d);
                    })
                    console.log(ip_target);
                    var all_route = '';
                    all_route = all_route +  ip_source + "==>";
                    for (var i = 1; i < show_route.length; i++) {
                        all_route = all_route + "dpid:" + parseFloat(show_route[i]) + "==>";
                    }
                    all_route = all_route +  + ip_target;
                    document.getElementById("id_route").value = all_route;
                    }
                    else { console.log("ping failed"); alert("ping failed"); }
                }
                else {
                    if (!get_srchost) { console.log("source ip wrong"); show_route.push("source ip wrong"); }
                    if (!get_dsthost) { console.log("target ip wrong"); show_route.push("target ip wrong"); }
                    var all_wrong = '';
                    show_route.forEach(function (d) {
                        all_wrong = all_wrong + d + "\r\n";
                    })
                    alert(all_wrong);
                }

            });
        });
    });
});

/*
function OnFocusFun(element,elementvalue)
{
if(element.value==elementvalue)
{
element.value="";
//element.style.color="#000";
}
}
//离开输入框时触发事件
function OnBlurFun(element,elementvalue)
{
if(element.value==""||element.value.replace(/\s/g,"")=="")
{
element.value=elementvalue;
//element.style.color="#999";
}
}
*/

function get_flow(route_no, d_h, ip_source, ip_target, route, route_port, route_num, links) {
    var flow;
    var flow_temp = $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:8080/stats/flow/" + route_no,
        dataType: 'json',
        async: false,
        complete: function (coordinates) {
            flow = coordinates;
        }
    });
    flow = flow_temp.responseText;
    var found_link = false;
    console.log("successfullygetflow");//test
    //O2(1)
    //处理JSON，删除变化的属性名
    console.log("O2(1)");
    var str = flow;
    str = str.substring(5, str.length - 1)
    var flow_i = eval('(' + str + ')');
    //处理完毕，flow_i为数组 
    //O2(1)开始

    flow_i.forEach(function (d_f) {
        if (d_f.actions[0].OUTPUT != "CONTROLLER") {
            if (d_f.match.nw_src == ip_source && d_f.match.nw_dst == ip_target) {
                //O2(2)
                console.log("O2(2)");
                var port = d_f.actions[0];
                route_port[2 * route_num - 1] = parseFloat(port.substring(8, port.length - 1));
                //O3(1)
                console.log("O3(1)");
                links.forEach(function (d_l) {
                    if (route[route_num] == d_l.src.dpid && route_port[2 * route_num - 1] == parseFloat(d_l.src.port_no)) {
                        //O3(2)
                        console.log("O3(2)");
                        found_link = true;
                        route[route_num + 1] = d_l.dst.dpid;
                        route_port[2 * route_num] = parseFloat(d_l.dst.port_no);

                    }
                })
                target_notget = found_link;
            }
        }
    })

    return found_link;
}