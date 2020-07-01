        $.holdReady(true);

        /* Avatar scaling */
        const dpiScales = {
            ldpi: 0.75,
            mdpi: 1,
            hdpi: 1.5,
            xhdpi: 2,
            xxhdpi: 3,
            xxxhdpi: 4,
        }
        const baseSize = 32;

        function setAvatarScale(dpi) {
            if (typeof dpiScales[dpi] === 'undefined') {
                dpi = 'mdpi'
            }
            localStorage.setItem('dpi', dpi);
            // Update image select dropdown
            $('.imagesizeselect.active').removeClass('active');
            $(`.imagesizeselect[data-dpi="${dpi}"]`).addClass('active');
            // Update image select size
            $('#selectedImageSize').text(dpiScales[dpi] * baseSize);
            // Resize avatar
            $('.operator-info').removeClass(Object.keys(dpiScales)).addClass(dpi);
        }

        $('.imagesizeselect').on('mouseup', function(event) {
            let dpi = $(this).attr('data-dpi');
            setAvatarScale(dpi);
        })

        /*===== Retrieve and set language =====*/
        var lang;
        var reg;

        if(!localStorage.getItem('gameRegion') || !localStorage.getItem('webLang')){
            localStorage.setItem("gameRegion", 'cn');
            localStorage.setItem("webLang", 'en');
            reg = "cn";
            lang = "en";
        } else {
            reg = localStorage.getItem('gameRegion');
            lang = localStorage.getItem('webLang');
        }

        $('.reg[value=' + reg + ']').addClass('selected');
        $('.lang[value=' + lang + ']').addClass('selected');

        /*===== Initialize the ★ option =====*/
        function actualize_optStars() {
            optStars = []
            $('button[opt-group="1"].btn-primary').each(function() {
                optStars.push($(this).attr("opt-id"))
            });

            localStorage.setItem("optStars", JSON.stringify(optStars));
        }

        if (!localStorage.getItem('optStars')) {
            actualize_optStars();
        } else {
            optStars = JSON.parse(localStorage.getItem('optStars'));
            $('button[opt-group="1"]').each(function() {
                if (!optStars.includes($(this).attr("opt-id"))) {
                    $(this).removeClass('btn-primary').addClass('btn-secondary');
                }
            });
        }

        /*===== Initialize the level option =====*/
        function actualize_optLevels() {
            optLevels = []
            $('button[opt-group="2"].btn-primary').each(function() {
                optLevels.push($(this).text());
            });

            localStorage.setItem("optLevels", JSON.stringify(optLevels));
        }

        if (!localStorage.getItem('optLevels')) {
            actualize_optLevels();
        } else {
            optLevels = JSON.parse(localStorage.getItem('optLevels'));
            $('button[opt-group="2"]').each(function() {
                if (!optLevels.includes($(this).text())) {
                    $(this).removeClass('btn-primary').addClass('btn-secondary');
                }
            });
        }

        /*===== Initialize the tags =====*/
        function actualize_tags() {
            checkedTags = []
            $(".btn-tag").each(function () {
                if ($(this).hasClass("btn-secondary")) return;
                checkedTags.push($(this).attr("mat-id"));
            });

            localStorage.setItem("checkedTags", JSON.stringify(checkedTags));
        }

        if (!localStorage.getItem('checkedTags')) {
            actualize_tags();
        } else {
            checkedTags = JSON.parse(localStorage.getItem('checkedTags'));
            $(".btn-tag").each(function() {
                if (checkedTags.includes($(this).attr("mat-id"))) {
                    $(this).removeClass('btn-secondary').addClass('btn-primary');
                }
            });
        }

        /*===== Retrieve and store materials =====*/
        var materials = {}
        $(".btn-tag").each(function () {
            materials[$(this).attr("mat-id")] = {};
        });

        var d0 = $.getJSON("json/gamedata/en_US/gamedata/excel/item_table.json", function (data) {
            $.each(data.items, function (key, item) {
                if (key in materials) {
                    materials[key]["en"] = item.name;
                    materials[key]["iconId"] = item.iconId;
                    materials[key].rarity = item.rarity + 1;
                }
            });
        });

        /*===== Put names into buttons =====*/
        $.when(d0).then(function() {
            $(".btn-tag").each(function() {
                $(this).text(materials[$(this).attr("mat-id")][lang])
            });
        });

        /*===== Retrieve and store characters =====*/
        var chars = { };
        var d1 = $.getJSON("json/gamedata/en_US/gamedata/excel/character_table.json", function (data) {
            $.each(data, function (key, char) {
                // retrieve E1 and E2 costs
                // var i = 0
                // console.log(key)
                char.phases.forEach(function (phase, elite_level) {
                    let elevel = "E" + elite_level;
                    if (phase.evolveCost) {
                        phase.evolveCost.forEach(function(mat, j) {
                            if (!(mat.id in chars)) chars[mat.id] = [];

                            chars[mat.id].push({
                                "class": elevel,
                                "id": key,
                                "name": char.name,
                                "count": mat.count,
                                "char_level": char.rarity + 1,
                                "elite": elite_level,
                            });
                        });
                    }
                });

                // retrieve skills costs
                char.allSkillLvlup.forEach(function (level, skill_level) {
                    if (!level.lvlUpCost) return;
                    level.lvlUpCost.forEach(function (mat, j) {
                        if (!(mat.id in chars)) chars[mat.id] = [];
                        chars[mat.id].push({
                            "class": "Skill-up",
                            "id": key,
                            "name": char.name,
                            "count": mat.count,
                            "char_level": char.rarity + 1,
                            "skill_index": 0,
                            "skill_level": skill_level + 2,
                        });
                    });
                });

                /// Skill #
                char.skills.forEach(function(skill, skill_index) {
                    /// Skill level
                    skill.levelUpCostCond.forEach(function (level, skill_level) {
                        if (!level.levelUpCost) return
                        level.levelUpCost.forEach(function (mat, j) {
                            if (!(mat.id in chars)) chars[mat.id] = [];

                            chars[mat.id].push({
                                "class": "Skill-up",
                                "id": key,
                                "name": char.name,
                                "count": mat.count,
                                "char_level": char.rarity + 1,
                                "skill_index": skill_index + 1,
                                "mastery_level": skill_level + 1,
                            });
                        });
                    });
                });
            });
            
        });

        
        $(document).ready(function() {
            $.getScript("js/aknav.js", function() {
                $('#to-tag').click(function() {      // When arrow is clicked
                    $('body,html').animate({
                        scrollTop : 0                       // Scroll to top of body
                    }, 500);
                });

                $('.dropdown-trigger').dropdown();
                $('[data-toggle="tooltip"]').tooltip();
            });

            /*===== Initialize the display options =====*/
            if (!localStorage.getItem('showInfo')) {
                localStorage.setItem("showInfo", JSON.stringify(true));
            } else if (!JSON.parse(localStorage.getItem('showImage'))) {
                $("#showInfo").toggleClass("btn-primary btn-secondary");
            }
            
            if (!localStorage.getItem('showImage')) {
                localStorage.setItem("showImage", JSON.stringify(true));
            } else if (!JSON.parse(localStorage.getItem('showImage'))) {
                $("#showImage").toggleClass("btn-primary btn-secondary");
            }

            localStorage.removeItem('size')
            let dpi = localStorage.getItem('dpi') || 'mdpi'
            setAvatarScale(dpi);
        });

        $.when(d0, d1).then(function () {
            if (checkedTags.length) {
                actualize();
            }
            $.holdReady(false)
        });

        function regDropdown(el) {
            localStorage.setItem('gameRegion', el.attr("value"));
            $(".dropdown-item.reg").removeClass("selected");
            el.addClass("selected");
            changeUILanguage(true);
        }

        function langDropdown(el) {
            localStorage.setItem('webLang', el.attr("value"));
            console.log("language : " + localStorage.getItem('webLang'))
            $(".dropdown-item.lang").removeClass("selected");
            el.addClass("selected");
            changeUILanguage(true);
        }

        function clickBtnClear() {
            $('.btn-tag').removeClass('btn-primary').addClass('btn-secondary');
            $("#tbody-recommend").html("");

            checkedTags = [];
            localStorage.removeItem('checkedTags');
        }

        function clickBtnOpt(el) {
            $(el).toggleClass("btn-primary btn-secondary");
            let checked = $(el).hasClass("btn-primary");

            // check all opt buttons when checking ALL
            if ($(el).hasClass("opt-all")) {
                if (checked) {
                    $('button[opt-group="' + $(el).attr("opt-group") + '"]').each(function(_, __) {
                        $(this).removeClass("btn-primary btn-secondary").addClass("btn-primary");
                    });
                }
            } else if (!checked) { // else unckeck ALL if a button is unchecked
                $('button[opt-group="' + $(el).attr("opt-group") + '"].opt-all').each(function (_, __) {
                    $(this).removeClass("btn-primary btn-secondary").addClass("btn-secondary");
                });
            }

            actualize_optStars();
            actualize_optLevels();
            actualize();
        }

        function clickBtnOpt2(el) {
            $(el).toggleClass("btn-primary btn-secondary");
            localStorage.setItem('showInfo', JSON.stringify($(el).hasClass("btn-primary")));

            actualize();
        }

        function clickBtnOpt3(el) {
            $(el).toggleClass("btn-primary btn-secondary");
            let showImage = $(el).hasClass("btn-primary")
            localStorage.setItem('showImage', JSON.stringify(showImage));

            if (showImage) {
                $('.avatar').show()
            } else {
                $('.avatar').hide()
            }

            // actualize();
        }

        // function changeImageSize(el) {
        //     localStorage.setItem('size', parseInt($(el).attr('title')));

        //     $("#selectedImageSize").html(JSON.parse(localStorage.getItem('size')));
        //     $(".imagesizeselect").each(function() {
        //         let size = JSON.parse(localStorage.getItem('size'));
        //         if($(this).attr("title") == size) {
        //             $("<span> <<</span>").appendTo(this);
        //         } else {
        //             $(this).html($(this).attr("title"));
        //         }
        //     });

        //     actualize();
        // }

        function clickBtnTag(el) {
            $(el).toggleClass("btn-primary btn-secondary");

            actualize_tags();
            actualize();
        }

        function changeUILanguage() {
            reg = localStorage.getItem('gameRegion');
            lang = localStorage.getItem('webLang');

            console.log(lang)
            console.log(reg)
            $('#display-reg').text(reg.toUpperCase())
            switch (lang) {
                case "en": $('#display-lang').text("English");  console.log('English'); break;
                case "cn": $('#display-lang').html("Chinese");  console.log('Chinese'); break;
                case "jp": $('#display-lang').text("Japanese"); console.log('Japanese');break;
                case "kr": $('#display-lang').text("Korean");   console.log('Japanese');break;
            }

            localStorage.setItem("gameRegion", reg);
            localStorage.setItem("webLang", lang);

            // rename tags given the language
            $(".btn-tag").each(function (_, btn) {
                btn.text(materials[btn["mat-id"]][lang]);
            });

            console.log("done");
            actualize();
        }

        var total_materials = {};
        function actualize() {
            $("#tbody-recommend").html("");

            let chars_selection = {}

            $(".btn-primary.btn-tag").each(function(_, btn) {
                let mat_id = $(btn).attr("mat-id");
                chars_selection[mat_id] = chars[mat_id];
            });

            let weights = [
                {field: 'char_level', direction: 'desc'}, // stars
                {field: 'elite', direction: 'asc'},
                {field: 'skill_index', direction: 'asc'},
                {field: 'mastery_level', direction: 'asc'},
                {field: 'skill_level', direction: 'asc'},
                {field: 'name', direction: 'asc'},
            ]
            const weightedSort = (props) => (a,b) => {
                for (let i = 0; i < props.length; i++) {
                    const k = props[i].field;
                    const aa = a[k] || 0;
                    const bb = b[k] || 0;
                    const d = props[i].direction === 'desc' ? -1 : 1;
                    const retval = (aa < bb ? -1 : aa > bb ? 1 : 0) * d;
                    if (retval !== 0) {
                        return retval;
                    }
                }
            };

            Object.keys(chars_selection).forEach(key => {
                chars_selection[key] = chars_selection[key]
                // filter by stars and levels
                .filter((char) => optStars.includes(char.char_level.toString()) && optLevels.includes(char.class))
                .sort(weightedSort(weights))
            });

            // var showImage = JSON.parse(localStorage.getItem('showImage'))
            var showInfo = JSON.parse(localStorage.getItem('showInfo'))
            var size = dpiScales[localStorage.getItem('dpi')] * baseSize;
            
            $.each(chars_selection, function (mat_id, chars) {
                let body = ['<tr class="tr-recommd"><td>', materials[mat_id][lang], "</td><td>"];

                total_materials[mat_id] = 0;
                console.log(chars)
                for (let char of chars) {
                    let style = !char.mastery_level ? 'style="background:#222"' : '';
                    let tooltip;
                     if (char.elite) {
                        tooltip = `Elite ${char.elite}`
                    } else if (char.mastery_level) {
                        tooltip = `Skill ${char.skill_index} M-${char.mastery_level}`;
                    } else {
                        tooltip = `Skill Lv.${char.skill_level}`;
                    }
                    
                    total_materials[mat_id] += char.count;

                    body.push('<button type="button"' +
                              ` class="ak-shadow-small ak-btn btn btn-sm btn-char my-1 ak-rare-${char.char_level}"` +
                              ' data-toggle="tooltip" data-placement="bottom" onclick="charSwap(this)"' +
                              ` "title="${char.name}" mat-id="${mat_id}" mat-count="${char.count}">`);

                    body.push('<div class="operator-info mdpi">');
                    body.push(`<div class="avatar"><img height="32" width="32" src="./img/avatars/${char.id}.png"></div>`);
                    body.push(`<div class="name">${char.name}</div>`)
                    body.push('</div>');

                    body.push(`<div class="material-usage" ${style} title="${tooltip}">`);
                    if(showInfo) {
                        if (char.elite) {
                            body.push(`<img width="40" src="img/ui/elite/${char.elite}-s.png">`);
                        } else if (char.mastery_level) {
                            body.push(`<div class="skill-index">S${char.skill_index}</div>`);
                            body.push(`<div class="skill-mastery"><img width="40" src='img/ui/rank/m-${char.mastery_level}.png'></div>`);
                        } else {
                            body.push(`<img width="40" src='img/ui/rank/${char.skill_level}.png'>`);
                        }
                    }else{
                        body.push(tooltip);
                    }
                    body.push(`</div>`);
                    body.push(`<div class="item-amount" style="color:#ddd">${char.count}x</div>`);
                
                    body.push("</button>\n")
                }

                let material = materials[mat_id]

                body.push(`<td><div class="internal-container rare-${material.rarity}">` +
                            `<img class="item-image" width=100 height=100 src="img/items/${material.iconId}.png">` +
                            `<div class="item-amount" mat-id="${mat_id}">${total_materials[mat_id]}x</div>` +
                          "</div></td>");
                $("#tbody-recommend").append(body.join(""));
            });

            $('[data-toggle="tooltip"]').tooltip();
        }

        function charSwap(el) {
            let mat_id = $(el).attr("mat-id");
            let removed = $(el).hasClass("removed-char");
            if (removed) {
                total_materials[mat_id] += parseInt($(el).attr("mat-count"), 10);
                $(el).removeClass("removed-char");
                $(el).css("opacity", "1");
            } else {
                total_materials[mat_id] -= parseInt($(el).attr("mat-count"), 10);
                $(el).addClass("removed-char");
                $(el).css("opacity", "0.5");
            }

            $('div[mat-id="' + mat_id + '"].item-amount').text(total_materials[mat_id] + "x");
        }

        function doubleclick(el) {
            setTimeout(function(){
                $(el).click();
            }, 200);
            $(el).click();
        }
