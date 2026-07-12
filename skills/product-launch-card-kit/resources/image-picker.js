(function attachLaunchCardImagePicker(options) {
  var settings = options || {};
  var selector = settings.selector || ".card img";
  var exportFlag = settings.exportFlag || function () {
    return document.documentElement.dataset.export === "1";
  };
  var input = document.createElement("input");
  var target = null;

  input.type = "file";
  input.accept = "image/png,image/jpeg,image/webp,image/gif";
  input.hidden = true;
  document.body.appendChild(input);

  document.querySelectorAll(selector).forEach(function (image) {
    image.classList.add("showcase-replaceable-image");
    image.title = "点击选择图片";
    image.addEventListener("click", function (event) {
      if (exportFlag()) return;
      event.preventDefault();
      target = image;
      input.value = "";
      input.click();
    });
  });

  input.addEventListener("change", function () {
    var file = input.files && input.files[0];
    if (!file || !target) return;
    var reader = new FileReader();
    reader.onload = function () {
      target.src = reader.result;
      target.alt = file.name;
      target.classList.add("is-replaced");
    };
    reader.readAsDataURL(file);
  });
}());
