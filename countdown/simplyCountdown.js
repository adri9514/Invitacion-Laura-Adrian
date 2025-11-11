"use strict";

/**
 * Función para detectar el tipo de variable, incluyendo compatibilidad con Symbol.
 */
function _typeof(t) {
  return (_typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
      ? function (t) {
          return typeof t;
        }
      : function (t) {
          return t &&
            typeof Symbol === "function" &&
            t.constructor === Symbol &&
            t !== Symbol.prototype
            ? "symbol"
            : typeof t;
        })(t);
}

(function (window) {
  /**
   * Función de utilidad para mezclar objetos (similar a Object.assign pero recursivo).
   */
  const mergeOptions = function (target, ...sources) {
    sources.forEach((source) => {
      Object.keys(source).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (_typeof(source[key]) === "object") {
            target[key] = target[key] || {};
            mergeOptions(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      });
    });
    return target;
  };

  /**
   * Crea los elementos HTML de cada sección del contador.
   */
  const createSection = function (parent, config, sectionClass) {
    const wrapper = document.createElement("div");
    const amount = document.createElement("span");
    const label = document.createElement("span");
    const inner = document.createElement("div");

    inner.appendChild(amount);
    inner.appendChild(label);
    wrapper.appendChild(inner);

    wrapper.classList.add(config.sectionClass, sectionClass);
    amount.classList.add(config.amountClass);
    label.classList.add(config.wordClass);

    parent.appendChild(wrapper);

    return { full: wrapper, amount: amount, word: label };
  };

  /**
   * Función principal del plugin.
   */
  window.simplyCountdown = function (selector, options) {
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : selector;

    const config = mergeOptions(
      {
        year: 2026,
        month: 10,
        day: 11,
        hours: 13,
        minutes: 0,
        seconds: 0,
        words: {
          days: { singular: "día", plural: "días" },
          hours: { singular: "hora", plural: "horas" },
          minutes: { singular: "minuto", plural: "minutos" },
          seconds: { singular: "segundo", plural: "segundos" },
        },
        plural: true,
        inline: false,
        enableUtc: false,
        onEnd: function () {},
        refresh: 1000,
        inlineClass: "simply-countdown-inline",
        sectionClass: "simply-section",
        amountClass: "simply-amount",
        wordClass: "simply-word",
        zeroPad: false,
        countUp: false,
      },
      options
    );

    const endDate = new Date(
      config.year,
      config.month - 1,
      config.day,
      config.hours,
      config.minutes,
      config.seconds
    );
    const finalDate = config.enableUtc
      ? new Date(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          endDate.getUTCHours(),
          endDate.getUTCMinutes(),
          endDate.getUTCSeconds()
        )
      : endDate;

    /**
     * Función que actualiza los valores del contador cada segundo.
     */
    const initCountdown = function (element) {
      const structure = config.inline
        ? (function () {
            const span = document.createElement("span");
            span.classList.add(config.inlineClass);
            element.appendChild(span);
            return span;
          })()
        : {
            days: createSection(element, config, "simply-days-section"),
            hours: createSection(element, config, "simply-hours-section"),
            minutes: createSection(element, config, "simply-minutes-section"),
            seconds: createSection(element, config, "simply-seconds-section"),
          };

      const update = function () {
        const now = new Date();
        const nowTime = config.enableUtc
          ? new Date(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds()
            )
          : now;

        let secondsDiff = (finalDate - nowTime.getTime()) / 1000;

        let days, hours, minutes, seconds;

        if (secondsDiff > 0) {
          days = Math.floor(secondsDiff / 86400);
          secondsDiff %= 86400;
          hours = Math.floor(secondsDiff / 3600);
          secondsDiff %= 3600;
          minutes = Math.floor(secondsDiff / 60);
          seconds = Math.floor(secondsDiff % 60);
        } else if (config.countUp) {
          secondsDiff = (nowTime.getTime() - finalDate) / 1000;
          days = Math.floor(secondsDiff / 86400);
          secondsDiff %= 86400;
          hours = Math.floor(secondsDiff / 3600);
          secondsDiff %= 3600;
          minutes = Math.floor(secondsDiff / 60);
          seconds = Math.floor(secondsDiff % 60);
        } else {
          days = hours = minutes = seconds = 0;
          clearInterval(interval);
          config.onEnd();
        }

        const word = (amount, unit) =>
          config.plural && amount !== 1
            ? config.words[unit].plural
            : config.words[unit].singular;

        if (config.inline) {
          structure.innerHTML = `${days} ${word(days, "days")}, ${hours} ${word(
            hours,
            "hours"
          )}, ${minutes} ${word(minutes, "minutes")}, ${seconds} ${word(
            seconds,
            "seconds"
          )}.`;
        } else {
          structure.days.amount.textContent =
            config.zeroPad && days < 10 ? `0${days}` : days;
          structure.days.word.textContent = word(days, "days");

          structure.hours.amount.textContent =
            config.zeroPad && hours < 10 ? `0${hours}` : hours;
          structure.hours.word.textContent = word(hours, "hours");

          structure.minutes.amount.textContent =
            config.zeroPad && minutes < 10 ? `0${minutes}` : minutes;
          structure.minutes.word.textContent = word(minutes, "minutes");

          structure.seconds.amount.textContent =
            config.zeroPad && seconds < 10 ? `0${seconds}` : seconds;
          structure.seconds.word.textContent = word(seconds, "seconds");
        }
      };

      update(); // Ejecutar la primera vez al cargar
      const interval = setInterval(update, config.refresh);
    };

    // Ejecutar para cada selector
    if (elements && Symbol.iterator in Object(elements)) {
      Array.prototype.forEach.call(elements, initCountdown);
    } else {
      initCountdown(elements);
    }
  };
})(window);

// Compatibilidad con jQuery
if (window.jQuery) {
  (function ($, countdownFn) {
    $.fn.simplyCountdown = function (options) {
      return countdownFn(this.selector, options);
    };
  })(jQuery, simplyCountdown);
}
