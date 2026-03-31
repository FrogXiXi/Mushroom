(function () {
  window.BirthdayUtils = {
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    },
  };
}());