(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    function init(event) {
        showCurrentLang();
        //let lang = getLang();
        let lang;
        let reg;
        let ms = {};
        let materials = new Map();
        let mByLvl = [[], [], [], [], []];
        let ismobile = $('#mobile-only-visible').is(':visible');
        let allns = []; let allhs = []; let allos = [];
        const MAX_TIER = 5;

        if(!localStorage.getItem('gameRegion') || !localStorage.getItem('webLang')){
            console.log("game region undefined");
            localStorage.setItem("gameRegion", 'cn');
            localStorage.setItem("webLang", 'en');
            reg = "cn";
            lang = "en";
        } else {
            reg = localStorage.getItem('gameRegion');
            lang = localStorage.getItem('webLang');
        }
        document.querySelector('.reg[value='+reg+']').classList.add('selected');
        document.querySelector('.lang[value='+lang+']').classList.add('selected');

        document.title = { 'cn': '明日方舟物料库存', 'en': 'Arknights Material Inventory' }[lang];
        document.querySelector('#display-reg').textContent = reg.toUpperCase()
        
        switch (lang) {
            case "en":document.querySelector('#display-lang').textContent = ("English");break;
            case "cn":document.querySelector('#display-lang').textContent = ("Chinese");break;
            case "jp":document.querySelector('#display-lang').textContent = ("Japanese");break;
            case "kr":document.querySelector('#display-lang').textContent = ("Korean");break;
        }
        $(document).on('change input paste', '.in-mc', calc);
        document.querySelectorAll('.btn-opt').forEach(btn => {
            btn.addEventListener('click', function () {
                $(this).toggleClass("btn-primary btn-secondary");
                let checked = $(this).hasClass("btn-primary");
                if (checked) $(".lvl-" + $(this).attr("opt-id")).show();
                else $(".lvl-" + $(this).attr("opt-id")).hide();
                if ($(this).attr("id") === "opt-all") {
                    $(".btn-opt").removeClass("btn-primary btn-secondary").addClass(
                        checked ? "btn-primary" : "btn-secondary"
                    );
                    for (let i = 1; i <= MAX_TIER; i++) {
                        if (checked) $(".lvl-" + i).show();
                        else $(".lvl-" + i).hide();
                    }
                } else {
                    if ($("#opt-all").hasClass("btn-primary")) {
                        $("#opt-all").toggleClass("btn-primary btn-secondary");
                    } else {
                        let checkedCount = 0;
                        $(".btn-opt").each(function (_, __) {
                            if ($(this).attr("id") === "opt-all") return;
                            if ($(this).hasClass("btn-primary")) checkedCount++;
                        });
                        if (checkedCount === MAX_TIER) $("#opt-all").toggleClass("btn-primary btn-secondary");
                    }
                }
                genUrl();
            });
        });

        let togglefilter = false ;
        $(document).on("click", "#btn-filter", () => {
            // if (ismobile)
            //     $(".card").each((_, e) => {
            //         let v = parseInt($(e).find(".in-lack").val());
            //         if (isNaN(v) || v === 0) $(e).hide();
            //     });
            // else
            togglefilter = !togglefilter;
            if(togglefilter){
                $(".ak-card-group").each((_, e) => {
                    let v = parseInt($(e).find(".in-lack").val());
                    if (isNaN(v) || v === 0) $(e).hide();
                });
            }else{
                $(".ak-card-group").each((_, e) => {
                    let v = parseInt($(e).find(".in-lack").val());
                    if (isNaN(v) || v === 0) $(e).show();
                });
            }
        });
        $(document).on("click", "#btn-reset", () => {
            $(".btn-option").removeClass("btn-primary btn-secondary").addClass("btn-primary");
            $(".in-mc, .in-lack").val("");
            $(".in-lack").each(function() {
                    $(this).css('background-color','#222');
            })
            // if (ismobile)
            //     $(".card").show();
            // else
                $(".ak-card-group").show();
        })
        let savedNeed = urlParam("n", "");
        let savedHave = urlParam("h", "");
        let savedOption = urlParam("o", "").split("+");
        if (!(savedHave === "" || savedNeed === "" || savedOption === "")) {
            $("#btn-load").show();
        } else {
            $("#btn-load").hide();
        }

        $(document).on("click", "#btn-load", () => {
            let needs = savedNeed.split("+");
            let haves = savedHave.split("+");
            for (let i = 0; i < needs.length; i++) {
                $("#need-" + i).val(needs[i]);
            }
            for (let i = 0; i < haves.length; i++) {
                $("#have-" + i).val(haves[i]);
            }
            $(".btn-opt").removeClass("btn-primary btn-secondary");
            for (let i = 1; i <= MAX_TIER; i++) {
                if (savedOption.includes(i.toString())) {
                    $(".btn-opt[opt-id='" + i + "']").addClass("btn-primary");
                    $(".lvl-" + i).show();
                } else {
                    $(".btn-opt[opt-id='" + i + "']").addClass("btn-secondary");
                    $(".lvl-" + i).hide();
                }
            }
            $("#opt-all").addClass(savedOption.length === MAX_TIER ? "btn-primary" : "btn-secondary");
            calc();
        });

        function checkOrDefault(val, pred, def) {
            return (pred(val) ? val : def);
        }

        // tfw not just use onclick... who deactivated onclick !?
        $(document).on("click", "#btn-update", () => {
            let url = $("#updater").val();
            console.log(url);
            $("#updater").val("");

            let names = Object.values(ms)
                              .filter(a => !a.hidden)
                              .sort((a, b) => (b.level - a.level))
                              .map(a => a.name_cn);

            let need_begin = url.search("[&?]n=") + 3;
            let need_end = checkOrDefault(url.indexOf("&", need_begin), a => a !== -1, url.length);
            let need = url.slice(need_begin, need_end)
                          .split("+")
                          .filter(a => !isNaN(Number(a)))
                          .reduce((vout, vin, i) => (vout[names[i]] = parseInt(vin), vout), {});

            let have_begin = url.search("[&?]h=") + 3;
            let have_end = checkOrDefault(url.indexOf("&", have_begin), a => a !== -1, url.length);
            let have = url.slice(have_begin, have_end)
                          .split("+")
                          .filter(a => !isNaN(Number(a)))
                          .reduce((vout, vin, i) => (vout[names[i]] = parseInt(vin), vout), {})

            calc(need, have,true);
        });

        loadMaterials();
    }

    function refresh(){
        ms = {};
        mByLvl = [[], [], [], [], []];
        $("#row-m").html("");
    }
    
    function loadMaterials(){
        refresh();
        let promises = [
            fetch("./json/tl-item.json").then(r=>r.json()),
            fetch("./json/akmaterial.json").then(r=>r.json()),
        ]
        Promise
        .all(promises)
        .then(response => {
            const data1 = response[0]
            const data = response[1]
            data.forEach(v => {
                // Use this to export and import
                let mm = new Map()
                mm.set('h', 0)
                mm.set('n', 0)
                materials.set(v.id, mm)
                ms[v.name_cn] = v
                if (!v.hidden) {
                    mByLvl[v.level - 1].push(v.name_cn)
                }
            })
            const minShowLevel = 2
            const colors = ['1', '2', '3', '4', '5']
            const stageCols = {
                "Always"    : "#090",
                "Common"    : "#990",
                "Medium"    : "#950",
                "Rare"      : "#930",
                "Very Rare" : "#900",
            }
            for (let i = MAX_TIER; i > 0; i--) {
                mByLvl[i-1].forEach(n => {
                    let srcHtml = []
                    const cardid = ms[n].id

                    Object.entries(ms[n].source).forEach(([k,v]) => {
                        const stageCol = stageCols[v] || '#555'
                        srcHtml.push('<small class="ak-sm-text"> <span class="ak-sm ak-back"style="background:'+stageCol+';color:#000"></span>' + k + '<span class="ak-sm ak-back">'+v+'</span>'+"</small>")
                    })

                    const isOnStage = (srcHtml !== "") ? ""
                        +     '<div class="card-body p-1 ak-c-black" style="padding:0px">'  
                        +         '<a class="ak-subtitle2 medium">Drop location :</a>'                  
                        +         srcHtml.join("<br />")
                        +     '</div>' : ""
                        +     '<div class="card-body p-1 ak-c-black" style="padding:0px">'  
                        +         '<a class="ak-subtitle2 medium">Only Craftable</a>'                  
                        +         srcHtml.join("<br />")
                        +     '</div>'

                    const item2 = data1.find(search => search.name_cn === ms[n].name_cn)
                    $("#row-m").append(
                        '<div class="ak-shadow-small ak-card-group m-1 lvl-' + ms[n]['level'] + '"style="' + (i < minShowLevel ? 'display:none' : '')+ ';padding:0;" data-id="'+cardid+'">'
                        +   '<div class="ak-card-container card ak-shadow-small ak-rare-bg' + '" style="border:transparent;padding:0px;z-index:1;">'
                        +     '<div class="ak-title ak-shadow-small" style="z-index:5;display:inline-block;white-space: nowrap;">'+item2["name_"+lang]+'</div>'  
                        +         '<img class="card-img-bg" style=";z-index:3;position:absolute" src="img/material/bg/item-'+ i + '.png">'
                        +         '<div class="ak-img-container" style="vertical-align:middle;padding-left:0px;margin:0px">'  
                        +             '<img class="card-img-top col-12" style="z-index:4;display: block;" src="img/material/'+ ms[n]['id'] + '.png">'
                        +         '</div>'       
                        + isOnStage
                        +   '</div>'
                        +   '<div class="ak-rare-' + colors[i - 1] +'" style="width:2px;margin:0px;padding:0;z-index:0"></div>'
                        +       '<div class="card p-0 ak-back ak-btn" style="min-width:78px;max-width:80px;margin:0px">'
                        +           '<div class="ak-shadow"style="height:16px"></div>'
                        +           '<div class="card-body p-1" style="padding:0px;margin:0px">'
                        +           '<form style="">'
                        +               '<div class="form-group mb-0">'
                        +`<div style='text-align:center'>`
                        +                   `<button type="button" class="btn btn-sm ak-btn" style='display: inline-block;width:10px;margin:auto;padding:0;background: #BBB;height:35px;margin-top:-4px;border-radius:2px 0px 0px 2px' onclick='Addition(-1,"need-${cardid}")'>-</button>`
                        +                   `<input type="text" min=0 class="form-control form-control-sm in-mc ak-btn" style="display: inline-block;border-radius:2px;padding:0;text-align:center;background:#333;border:transparent;color:#DDD;height:35px;width:40px" placeholder="${{ 'cn': '需要', 'en': 'Need', 'kr': '필요량' }[lang]}" id="need-${cardid}"/>`
                        +                   `<button type="button" class="btn btn-sm ak-btn" style='display: inline-block;width:10px;margin:auto;padding:0;background: #BBB;height:35px;margin-top:-4px;border-radius:0px 2px 2px 0px' onclick='Addition(1,"need-${cardid}")'>+</button>`
                        +`</div>`
                        +`<div style='text-align:center'>`
                        +                   `<button type="button" class="btn btn-sm ak-btn" style='display: inline-block;width:10px;margin:auto;padding:0;background: #BBB;height:35px;margin-top:-4px;border-radius:2px 0px 0px 2px' onclick='Addition(-1,"have-${cardid}")'>-</button>`
                        +                   `<input type="text" min=0 class="form-control form-control-sm mt-1 in-mc   ak-mid" style="display: inline-block;border-radius:2px;padding:0;text-align:center;background:#333;border:transparent;color:#DDD;height:35px;width:40px" placeholder="${{ 'cn': '已有', 'en': 'Have', 'kr': '보유량' }[lang]}" id="have-${cardid}"/>`
                        +                   `<button type="button" class="btn btn-sm ak-btn" style='display: inline-block;width:10px;margin:auto;padding:0;background: #BBB;height:35px;margin-top:-4px;border-radius:0px 2px 2px 0px' onclick='Addition(1,"have-${cardid}")'>+</button>`
                        +`</div>`
                        +                   `<input type="text" class="form-control form-control-sm mt-1 in-lack ak-mid" style="border-radius:2px;padding:0;text-align:center;background:#222;border:transparent;color:#DDD" placeholder="${{ 'cn': '仍需', 'en': 'Lack', 'kr': '부족량' }[lang]}" id="lack-${cardid}"/>`
                        +               '</div>'    
                        +           '</form>'
                        
                        +       '</div>'
                        +   '</div>'
                        )
                    /**
                        if (!ismobile) {
                        
                        } else {
                            $("#row-m").append(
                                '<div class="card col-4 my-1 p-0 lvl-' + ms[n]['level'] + ' border-' + colors[i - 1]
                                + '" ' + (i < minShowLevel ? 'style="display:none;"' : '')
                                + '><img class="card-img-top" style="max-width:70px;margin:auto;" src="img/material/'
                                + ms[n]['id'] + '.png"><div class="card-body p-1 p-md-2">'
                                + n + '<br />'
                                + srcHtml.join("<br />")
                                + '<form><div class="form-group mb-0">'
                                + '<input type="text" class="form-control form-control-sm mt-1 in-mc" placeholder="' + { 'cn': '需要', 'en': 'Need' }[lang] + '" id="need-' + cardid + '"/>'
                                + '<input type="text" class="form-control form-control-sm mt-1 in-mc" placeholder="' + { 'cn': '已有', 'en': 'Have' }[lang] + '" id="have-' + cardid + '"/>'
                                + '<input type="text" class="form-control form-control-sm mt-1 in-lack" placeholder="' + { 'cn': '仍需', 'en': 'Lack' }[lang] + '" id="lack-' + cardid + '" disabled/>'
                                + '</div></form>'
                                + '</div></div>'
                            );
                        }
                    **/
                })
                $("#row-m").append('<div class="w-100 my-1" style="padding:2px;background:#111;border-radius:2px"/>')
            }
        })
    }

    function Addition(num,id){
        // console.log(id)
        if(!$(`#${id}`).val())$(`#${id}`).val(0)
        if(parseInt($(`#${id}`).val())+num>=0){
            $(`#${id}`).val(parseInt($(`#${id}`).val())+num)
            calc()
        }
    }

    function genUrl() {
        allos = [];
        const len = Object.keys(ms).length
        const allhs2 = []
        const allns2 = []
        for (let i = 0; i < len; i++) {
            allhs2.push($('#have-'+i).val() || 0)
            allns2.push($('#need-'+i).val() || 0)
        }
        for (let i = 1; i <= MAX_TIER; i++) {
            if ($(".btn-opt[opt-id='" + i + "']").hasClass("btn-primary")) allos.push(i);
        }
        const url = new URL(window.location.href)
        url.searchParams.set('n', allns2.join(" "))
        url.searchParams.set('h', allhs2.join(" "))
        url.searchParams.set('o', allos.join(" "))
        $(".save").attr("href", url);
    }

    function calc(narray = {}, harray = {},isauto=false) {
        let counts = {};
        ms.forEach((n, m) => {
            let need = parseInt($("#need-" + m['id']).val());
            if (isNaN(need)) need = 0;
            if(isauto) need += n in narray ? narray[n] : 0;

            let have = parseInt($("#have-" + m['id']).val());
            if (isNaN(have)) have = 0;
            if(isauto)have += n in harray ? harray[n] : 0

            let diff = need - have;

            counts[n] = {
                'need': need,
                'have': have,
                'upper': 0,
                'compose': 0,
                'lack': diff > 0 ? diff : 0
            }
            // console.log(n)
            // console.log(counts[n])
        });
        for (let i = 4; i >= 0; i--) {
            $.each(mByLvl[i], (_, n) => {
                $.each(ms[n].madeof, (mon, moc) => {
                    if(counts[mon]){
                        counts[mon].upper += moc * counts[n].lack;
                        let diff = counts[mon].need + counts[mon].upper - counts[mon].have;
                        counts[mon].lack = diff > 0 ? diff : 0;
                    }else{
                        console.log(n + " error")
                    }
                    
                });
            });
        }
        for (let i = 1; i < MAX_TIER; i++) {
            $.each(mByLvl[i], (_, n) => {
                let m = ms[n];
                if (counts[n].lack === 0) return;
                let maxCompose = $.isEmptyObject(m['madeof']) ? 0 : Number.MAX_SAFE_INTEGER;
                $.each(m['madeof'], (man, mac) => {
                    let cm = counts[man];
                    if (cm.have / mac < maxCompose) {
                        maxCompose = cm.have / mac;
                    }
                });
                maxCompose = Math.floor(maxCompose > counts[n].lack ? counts[n].lack : maxCompose);
                if (maxCompose > 0) {
                    $.each(m['madeof'], (man, mac) => {
                        counts[man].have -= maxCompose * mac;
                    });
                    console.log(n + maxCompose);
                    counts[n].have += maxCompose;
                    counts[n].lack = counts[n].need + counts[n].upper > counts[n].have ? counts[n].need + counts[n].upper - counts[n].have : 0;
                }
            });
        }
        allns = []; allhs = [];
        $.each(ms, (n, m) => {
            if(isauto)$("#have-" + m['id']).val(counts[n]['have']);
            if(isauto)$("#need-" + m['id']).val(counts[n]['need']);
            $("#lack-" + m['id']).val(counts[n]['lack']);
        })
        $.each(ms, (_, m) => {
            allns.push(counts[m.name_cn].need);
            allhs.push(counts[m.name_cn].have);
        });
        $(".in-lack").each(function() {
            // console.log("wei")
        if($(this).val() >= 1){
                $(this).css('background-color','#300');
            }else{
                $(this).css('background-color','#222');
            }
        })
        genUrl();
    }
    

/*
$(document).arrive("#regionDropdown", function(){
    $("#navitemRegion").addClass('ak-disable2');
    $("#navitemLanguage").addClass('ak-disable2');
});
*/

function test() {
    // setTimeout(function() {
        for (var i = 0; i < 13; i++) {
            Addition(10, 'need-'+i)
            Addition(1, 'have-'+i)
        }
        genUrl()
        let url = $(".save").attr("href")
        // console.log(url)
        $('#btn-reset').trigger('click')
        $('#updater').val(url)
        update()
    // }, 1000)
}

function update() {
    let url = new URL($('#updater').val())
    console.log(url)
    let hs = url.searchParams.get('h')
    let ns = url.searchParams.get('n')
    let os = url.searchParams.get('o')
    hs.split(' ').forEach((h, i) => {
        Addition(parseInt(h), 'have-'+i)
        materials.get(i).set('h', h)
    })
    ns.split(' ').forEach((n, i) => {
        Addition(parseInt(n), 'need-'+i)
        materials.get(i).set('n', n)
    })
    let flags = 0
    let rarities = os.split(' ').reduce((acc, o) => {
        let rarity = parseInt(o)
        flags |= (2 << (rarity - 1))
        acc[rarity] = true
        return acc
    }, {})
    for (let i = 0; i < MAX_TIER; i++) {
        let rarity = parseInt(i+1)
        let $this = $('[opt-id="'+rarity+'"]')
        $this.removeClass('btn-primary btn-secondary')
        if (rarities[rarity]) {
            $this.addClass('btn-primary')
        } else {
            $this.addClass('btn-secondary')
        }
    }

    let temp = new Map()
    temp.set('m', materials)
    temp.set('o', flags)
    console.log(temp)
}

function serialize(m) {
    let s = ''
    Object.keys().sort()
    for (let [k,v] of m) {

    }
}

test()

});

