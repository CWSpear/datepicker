 var Datepicker = (function () {

  var DAYS_A_WEEK = 7
    , MAX_WEEKS_IN_MONTH = 6
    , months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    , days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    , today = new Date();

  function isLeapYear(year) {
    return year % 4 === 0 && !(year % 100 === 0 && year % 400 != 0)
  }

  function monthDays(date) {
    var month = date.getMonth()
      , monthDays = [31, isLeapYear(date.getFullYear()) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthDays[month]
  }

  function buildDay(node) {
    var _this = this
      , firstDay = new Date(this.selectedDate)
      , currentDay = new Date(this.selectedDate)
      , data = node['data']
      , cssClass = 'days-cell'
      , offset, index;

    firstDay.setDate(1);
    index = (data.col + 1 + (data.row * DAYS_A_WEEK)) - firstDay.getDay();
    currentDay.setDate(index);
    value = currentDay.getDate();

    /* Setup class */
    if (currentDay.getTime() === this.selectedDate.getTime()) {
      cssClass += ' selected';
    }
    if (index <= 0 || index > monthDays(this.selectedDate)) {
      cssClass += ' off';
    }
    node['class'] = cssClass;
    node['onclick'] = function () {
      _this.setSelectedDate(currentDay);
    };
    node['value'] = currentDay.getDate();
  }

  function buildNode(node) {
    var _this = this;

    function _build(node) {
      var element, i, max;

      /* Run before build */
      if ('beforebuild' in node) {
        node['beforebuild'].call(_this, node);
      }

      /* Create the element */
      if (!('element' in node)) {
        node['element'] = document.createElement(node['tag']);
      }

      /* Attach a data hash to the element */
      if ('data' in node) {
        node['element'].data = node['data'];
      }

      /* Set css class. */
      if ('class' in node) {
        node['element'].setAttribute('class', node['class']);
      }

      /* Set inner html. */
      if ('value' in node) {
        if (typeof node['value'] === 'function') {
          node['element'].innerHTML = node['value']();
        }
        else {
          node['element'].innerHTML = node['value'];
        }
      }

      /* Set onclick */
      if ('onclick' in node) {
        node['element'].onclick = node['onclick'];
      }

      /* Go through children. */
      if ('children' in node) {
        for (i = 0, max = node['children'].length; i < max; i++) {
          node['element'].appendChild(_build(node['children'][i]));
        }
      }

      return node['element'];
    }
    return _build(node);
  };

  function constructor(element, options) {
    var _this = this;

    options = options || {};

    this.onDateChanged = options.onDateChanged;
    this.container = element;
    this.monthNames = options.monthNames || months;
    this.dayNames = options.dayNames || days;

    /* Calendar DOM element tree */
    this.elements = [];
    /* Year */
    this.elements[0] = { tag: 'div', children: [], class: 'year' };
    this.elements[0]['children'][0] = { tag: 'a', class: 'dec', onclick: function () { _this.incrementMonth(-12); return false; } };
    this.elements[0]['children'][1] = { tag: 'a', class: 'inc', onclick: function () { _this.incrementMonth(12); return false; } };
    this.elements[0]['children'][2] = { tag: 'label', value: function () { return _this.selectedDate.getFullYear(); } };
    /* Month */
    this.elements[1] = { tag: 'div', children: [], class: 'month' };
    this.elements[1]['children'][0] = { tag: 'a', class: 'dec', onclick: function () { _this.incrementMonth(-1); return false; } };
    this.elements[1]['children'][1] = { tag: 'a', class: 'inc', onclick: function () { _this.incrementMonth(1); return false; } }
    this.elements[1]['children'][2] = { tag: 'label', value: function () { return _this.monthNames[_this.selectedDate.getMonth()]; } };
    /* Day names */
    this.elements[2] = { tag: 'div', children: [], class: 'days-names' }
    for (var i = 0; i < DAYS_A_WEEK; i++) {
      this.elements[2]['children'][i] = { tag: 'label', value: _this.dayNames[i] };
    }
    /* Dates */
    this.elements[3] = { tag: 'div', children: [], class: 'days' };
    for (var i = 0; i < MAX_WEEKS_IN_MONTH; i++) {
      this.elements[3]['children'][i] = { tag: 'div', children: [], class: 'days-row' }
      for (var j = 0; j < DAYS_A_WEEK; j++) {
        this.elements[3]['children'][i]['children'][j] = { tag: 'div', data: { row: i, col: j }, beforebuild: buildDay };
      }
    }

    this.setSelectedDate(today);
  }

  constructor.prototype.incrementMonth = function (amount) {
    var month = this.selectedDate.getMonth();
    this.selectedDate.setMonth(month + amount);
    this.build();
  };

  constructor.prototype.setSelectedDate = function (date) {
    this.selectedDate = date;
    this.build();
    if (typeof this.onDateChanged === 'function') {
      this.onDateChanged(date);
    }
  };

  constructor.prototype.build = function () {
    /* Build one by one */
    for (var i = 0, max = this.elements.length; i < max; i++) {
      this.container.appendChild(buildNode.call(this, this.elements[i]));
    }
  };

  return constructor;

}());
