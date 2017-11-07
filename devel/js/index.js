$().ready(function() {
  var bodyHeight = $('body').outerHeight(true);
  var menu = $('.nav__list');
  var menuItemActive = menu.find('.nav__item_active');
  var classLink = '.nav__link';
  var classItem = '.nav__item';
  // количесво видимых элементов с каждой стороны от активного элемента
  var quantityItem = 5;

  var clickIndex = 0;
  var activeElementPosition, activeElementIndex, items;

  var aside = $('.aside');
  var asideHeight = aside.innerHeight();
  var asideCenter = asideHeight / 2;
  var asideOffsetTop = aside.offset().top;


  /////////////////////////////////////////////////
  //  вызов функций
  /////////////////////////////////////////////////
  createCopyList();
  // вызываем драг
  drag();
  // отслеживаем клик по элементам
  click();

  arrowClick();





  /////////////////////////////////////////////////
  //  функции
  /////////////////////////////////////////////////

  // Создает копии списка
  function createCopyList() {

    // Удаляет классы из строки
    var menuChild = menu.html()
      .replace(/ nav__item_activeNext2/g, '')
      .replace(/ nav__item_activePrev2/g, '')
      .replace(/ nav__item_activeNext/g, '')
      .replace(/ nav__item_activePrev/g, '')
      .replace(/ nav__item_active/g, '');
    // .replace(/ nav__item_visible/g, '');

    // Вставляет одну копию перед списком
    menu.prepend(menuChild);
    // Вставляет "нужное" количество (listCount) копий в список
    var listCount = Math.ceil(bodyHeight / menu.height());
    for (var i = 0; i < listCount; i++) {
      menu.prepend(menuChild);
      menu.append(menuChild);
    }

    // список удлинен,теперь можно узнать высоту списка
    navCenter();
  }

  // Задает размер меню и центрирует
  function navCenter() {
    var navHeight = 0;
    var prev = menuItemActive;
    for (var i = 0; i < quantityItem; i++) {
        navHeight += prev.prev().height() * 2;
        prev = prev.prev();
    }
    navHeight += menuItemActive.height();
    $('.nav').css({
      'height': navHeight + 'px',
      'top': ($('.nav').parent().height() - navHeight) / 2 + 'px'
    });
    $('.nav__arrow').height((asideHeight - navHeight) / 2);

    // меню установлено,теперь можно вычислить позицию меню
    activePosition();
  }

  // вычисляет нужную позицию меню
  function activePosition() {
    // Значение свойства "top" для списка
    activeElementPosition = (menu.parent().height() / 2) -
      menuItemActive.position().top -
      (menuItemActive.innerHeight() / 2);

    // узнает индекс активого элемента
    activeElementIndex = menuItemActive.index();

    // позиция записанна в переменную (значение статично), теперь можно задать позицию для меню
    centerActiveElement();
  }

  // Центрирует активный элемент
  function centerActiveElement() {
    menu.stop(true).animate({
      'top': activeElementPosition + 'px'
    }, 250);

    tabContent();
  }

  // Манипулирует активными классами
  function replaceClassElements(elem) {
    var strPrev = 'nav__item_activePrev';
    var strNext = 'nav__item_activeNext';
    var strPrev2 = 'nav__item_activePrev2';
    var strNext2 = 'nav__item_activeNext2';
    var strActive = 'nav__item_active';
    var elemIndex = $(elem).index();
    var itemsMenu = menu.find('.nav__item');
    $(elem).prev().addClass(strPrev).siblings().removeClass(strPrev);
    $(elem).prev().prev().addClass(strPrev2).siblings().removeClass(strPrev2);
    $(elem).next().addClass(strNext).siblings().removeClass(strNext);
    $(elem).next().next().addClass(strNext2).siblings().removeClass(strNext2);
    $(elem).addClass(strActive).removeClass(strNext + ' ' + strNext2 + ' ' + strPrev2 + ' ' + strPrev).siblings().removeClass(strActive);
    // itemsMenu.removeClass('nav__item_visible');
    // for (var i = 0; i <= quantityItem; i++) {
    //   itemsMenu.eq(elemIndex - i).addClass('nav__item_visible');
    //   itemsMenu.eq(elemIndex + i).addClass('nav__item_visible');
    // }
  }

  // Draggable
  function drag() {
    var mult = 0.65;
    items = menu.find('.nav__item');
    menu.draggable({
      axis: "y",
      scroll: false,
      // начало перемещения
      start: function(event, ui) {
        // var _this = $(this);
        // if (!_this.hasClass('noClick')) {
        //   _this.addClass('noClick');
        // }
        // $('.nav__arrow').addClass('drag');
      },
      // перемещение
      drag: function(event, ui) {
        ui.position.top -= (ui.position.top - ui.originalPosition.top) * mult;
        for (var i = 0; i < items.length; i++) {
          if ($(items[i]).offset().top <= asideOffsetTop + asideCenter && ($(items[i]).offset().top + $(items[i]).innerHeight()) >= asideOffsetTop + asideCenter) {
            if (!$(items[i]).hasClass('nav__item_active')) {
              replaceClassElements(items[i]);
            }
          }
        }
      },
      // конец перемещения
      stop: function(event, ui) {
        // $('.nav__arrow').removeClass('drag');
        loop();
        centerActiveElement();
      }
    });
  }

  // зацикливает список (бесконечность)
  function loop() {
    var nowActiveIndex = menu.find('.nav__item_active').index();

    if (nowActiveIndex < activeElementIndex) {
      for (var i = 0; i < (activeElementIndex - nowActiveIndex); i++) {
        items = menu.find('.nav__item');
        var item = items[items.length - 1];
        var menuTop = +menu.css('top').replace('px', '') - $(item).innerHeight() + 'px';
        $(item).prependTo(menu);
        menu.css({
          'top': menuTop
        })
      }
    }
    if (nowActiveIndex > activeElementIndex) {
      for (var i = 0; i < (nowActiveIndex - activeElementIndex); i++) {
        items = menu.find('.nav__item');
        var item = items[0];
        var menuTop = +menu.css('top').replace('px', '') + $(item).innerHeight() + 'px';
        $(item).appendTo(menu);
        menu.css({
          'top': menuTop
        })
      }
    }
  }

  //клик на элемент списка
  function click() {
    menu.find('.nav__link').on('click', function(e) {
      e.preventDefault();
      // выполнить если небыло клика (второй клик не выполняется)
      if (clickIndex === 0) {
        var newItemIndex = $(this).closest('.nav__item').index() - activeElementIndex;
        // анимирует добавление и удаление классов при клике
        var animateTimer = setTimeout(function tick() {
          // если клик был до активного элемента
          if (newItemIndex < 0) {
            replaceClassElements(menu.find('.nav__item_active').prev());
          }
          // если клик был после активного элемента
          if (newItemIndex > 0) {
            replaceClassElements(menu.find('.nav__item_active').next());
          }
          loop();
          centerActiveElement();
          // рекурсия и остановка таймера
          if ((Math.abs(newItemIndex) - 1) > clickIndex) {
            animateTimer = setTimeout(tick, 70);
            clickIndex++;
          } else {
            clearTimeout(animateTimer);
            clickIndex = 0;
          }
        }, 0);
      }
    })
  }

// клик по стрелкам
function arrowClick() {
   $('.nav__arrow').on('click', function functionName() {
     if ($(this).hasClass('nav__arrow_next')) {
       replaceClassElements(menu.find('.nav__item_active').next());
     }
     if ($(this).hasClass('nav__arrow_prev')) {
       replaceClassElements(menu.find('.nav__item_active').prev());
     }
     loop();
     centerActiveElement();
   });
 }

function tabContent() {
  var itemID = $('.nav__item_active .nav__link').attr('href');
  $(itemID).addClass('visible__article').siblings().removeClass('visible__article');
}



});
