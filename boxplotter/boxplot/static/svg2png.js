function getSVGString(svgNode) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');
	return svgString;
}

function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';
	var imgsrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svgString)));
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect(0, 0, width, height);
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob(function(blob) {
			var filesize = Math.round(blob.length/1024) + ' KB';
			if (callback) callback(blob, filesize);
		});
	};

	image.src = imgsrc;
}