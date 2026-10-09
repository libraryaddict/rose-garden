// eslint-disable-next-line @typescript-eslint/no-require-imports
var kol = require("kolmafia");

module.exports.main = function main(pageTextEncoded) {
  var pageText = kol.urlDecode(pageTextEncoded);
  var multiplier = 35;
  var found = pageText.match(/var RG = (.*?);<\/script>/);

  if (!found) {
    return;
  }

  var data = JSON.parse(found[1]);
  var grid = data.grid;

  var output = `<svg width='${31 * multiplier}' height='${
    31 * multiplier
  }' viewbox='0 0 ${31 * multiplier} ${
    31 * multiplier
  }' xmlns='http://www.w3.org/2000/svg'>`;

  var shortMult = multiplier * 0.2;
  var largeMult = multiplier * 0.8;
  var wallLines = {
    5: [
      [0, multiplier / 3, multiplier, multiplier / 3],
      [0, (2 * multiplier) / 3, multiplier, (2 * multiplier) / 3],
      [multiplier / 2, 0, multiplier / 2, multiplier / 3],
      [multiplier / 4, multiplier / 3, multiplier / 4, (2 * multiplier) / 3],
      [
        (3 * multiplier) / 4,
        multiplier / 3,
        (3 * multiplier) / 4,
        (2 * multiplier) / 3,
      ],
      [multiplier / 2, (2 * multiplier) / 3, multiplier / 2, multiplier],
    ],
    6: [
      [shortMult, multiplier / 2, largeMult, multiplier / 2],
      [shortMult, shortMult, shortMult, largeMult],
      [multiplier / 2, shortMult, multiplier / 2, largeMult],
      [largeMult, shortMult, largeMult, largeMult],
    ],
    7: [
      [0, multiplier / 2, multiplier / 2, 0],
      [0, multiplier, multiplier, 0],
      [multiplier / 2, multiplier, multiplier, multiplier / 2],
      [0, multiplier / 2, multiplier / 2, multiplier],
      [0, 0, multiplier, multiplier],
      [multiplier / 2, 0, multiplier, multiplier / 2],
    ],
  };
  output += "<defs>";

  for (var wall in wallLines) {
    output += `<pattern id='wall${wall}' patternUnits='userSpaceOnUse' width='${
      multiplier
    }' height='${multiplier}'><rect width='${multiplier}' height='${
      multiplier
    }' fill='black'/>`;

    for (var l of wallLines[wall]) {
      output += `<line x1='${l[0]}' y1='${l[1]}' x2='${l[2]}' y2='${
        l[3]
      }' stroke='white' stroke-width='1.5'/>`;
    }

    output += "</pattern>";
  }

  output += "</defs>";

  for (var x = 0; x < 31; x++) {
    for (var y = 0; y < 31; y++) {
      var chr = grid.charAt(31 * y + x);
      var fill;
      var style = "stroke-width:1;stroke:black";

      if (chr === "0" || chr === "4") {
        fill = "lightyellow";
      } else if (chr === "1") {
        fill = "black";
      } else if (chr === "2") {
        fill = "lemonchiffon";
      } else if (chr === "3") {
        fill = "#FFB8B8";
      } else if (chr === "5" || chr === "6" || chr === "7") {
        fill = `url(#wall${chr})`;
        style = "stroke-width:1;stroke:#777777";
      } else if (chr === "8") {
        fill = "lime";
      } else {
        fill = "orange";
      }

      output += `<rect width='${multiplier}' height='${multiplier}' x='${
        x * multiplier
      }' y='${y * multiplier}' fill='${fill}' style='${style}'/>`;
    }
  }

  for (var poi of data.pois) {
    if (kol.getProperty("vr1637_printPois") === "true") {
      kol.print(JSON.stringify(poi));
    }

    fill = "blue";

    if (poi.k === "fountain") {
      fill = "cyan";
    } else if (poi.k === "monster") {
      fill = "darkred";
    } else if (poi.k === "food" || poi.k === "booze" || poi.k === "spleen") {
      fill = "green";
    } else if (poi.k === "chest") {
      fill = "orange";
    }

    output += `<circle cx='${multiplier * poi.x + multiplier * 0.5}' cy='${
      multiplier * poi.y + multiplier * 0.5
    }' r='${multiplier * 0.3}' fill='${
      poi.d === 1 ? "silver" : fill
    }' style='stroke-width:10;stroke:${fill}'/>`;
  }

  output += `<polygon points='0,${multiplier * -0.4} ${multiplier * 0.3},${
    multiplier * 0.35
  } 0,${multiplier * 0.15} ${multiplier * -0.3},${
    multiplier * 0.35
  }' style='fill:lime;stroke:black;stroke-width:2' transform='translate(${
    multiplier * data.pos.x + multiplier * 0.5
  },${multiplier * data.pos.y + multiplier * 0.5}) rotate(${
    data.pos.f * 90
  })'/>`;

  var PLAQUE_OFFSETS = [
    [multiplier * 0.5, multiplier],
    [0, multiplier * 0.5],
    [multiplier * 0.5, 0],
    [multiplier, multiplier * 0.5],
  ];
  output += `<style>.plaque{fill:#FF7F7F;font:${
    multiplier * 0.6
  }px bolder;font-family:monospace;stroke:black;stroke-width:3px;paint-order:stroke}</style>`;

  if (kol.getProperty("vr1637_printPlaques") === "true") {
    kol.print(`"plaques": ${JSON.stringify(data.plaques)}`);
  }

  for (var plaque of data.plaques) {
    output += `<text x='${
      multiplier * plaque.x + PLAQUE_OFFSETS[plaque.f][0]
    }' y='${
      multiplier * plaque.y + PLAQUE_OFFSETS[plaque.f][1]
    }' text-anchor='middle' dominant-baseline='middle' class='plaque'>${plaque.icon
      .substring(5, 6)
      .toUpperCase()}</text>`;

    if (kol.getProperty("vr1637_printPlaques") === "true") {
      kol.print(
        `(${plaque.x},${plaque.y}): ${plaque.icon
          .substring(5, 6)
          .toUpperCase()}${plaque.f}`,
      );
    }
  }

  output += "</svg>";

  if (kol.getProperty("vr1637_saveSvg") === "true") {
    kol.bufferToFile(output, "rose_garden_map.svg");
    kol.print("Map written to data/rose_garden_map.svg", "blue");
  }

  // 1 to invalidate the hash
  var mapHash = 1;

  var mapText =
    data.grid +
    JSON.stringify(data.plaques) +
    // i = id, x,y = cords, k = kind/name/type
    JSON.stringify(data.pois.map((poi) => [poi.i, poi.x, poi.y, poi.k]));

  for (chr of mapText) {
    // If you hit a hash collision, please buy a lotto ticket!
    mapHash = (mapHash * 31 + chr.charCodeAt(0)) | 0;
  }

  // Migrate setting
  if (kol.propertyExists("vr1637_submittedMap")) {
    // Keeps the hash so we dont get dupes
    if (!kol.propertyExists("roseGarden_submittedMap")) {
      kol.setProperty(
        "roseGarden_submittedMap",
        kol.getProperty("vr1637_submittedMap"),
      );
    }

    kol.removeProperty("vr1637_submittedMap");
  }

  // Compare the saved hash to ensure things are not spammed
  var submitted =
    kol.getProperty("roseGarden_submittedMap") === String(mapHash);

  // Escape and add spaces to prevent kol breaking it up
  var escaped = found[1]
    .replace(/\\/g, "\\\\")
    .replace(/ /g, "\\s")
    .replace(/(?:\\[\\s])+/g, (block) => ` ${block} `);
  // Kmails are encoded, then KoL's backend is limiting them to 2k chars
  var encoded = kol.entityEncode(escaped);
  var chunks = [];

  for (var start = 0; start < encoded.length; ) {
    var end = start + 1900;
    var entityStart = encoded.lastIndexOf("&", end - 1);

    // Go back if the part would cut an entity in half
    if (entityStart > encoded.lastIndexOf(";", end - 1)) {
      end = entityStart;
    }

    // Keep going while the part would end inside or right after an escape
    while (
      end < encoded.length &&
      encoded.substring(end - 2, end).includes("\\")
    ) {
      end++;
    }

    chunks.push(kol.entityDecode(encoded.substring(start, end)));
    start = end;
  }

  // Each section, that's going in a kmail of their own. The bot's name is enough
  var parts = chunks.map((chunk, i) => `(${i + 1}/${chunks.length})${chunk}`);

  var inlineMap = kol.getProperty("roseGarden_inlineMap") === "true";
  var noCheating = kol.getProperty("roseGarden_noCheating") === "true";

  var button = `<script>
	// Source - https://stackoverflow.com/a/23667012
	// Posted by ace
	// Retrieved 2026-10-01, License - CC BY-SA 3.0

	var svgStr = ${JSON.stringify(output)};
	var mapPos = RG.pos;

	function makeSvg() {
		var multiplier = ${multiplier};
		var x = document.createElement("div");
		x.innerHTML = svgStr;
		var svg = x.firstChild;

		var cursorX = multiplier * mapPos.x + multiplier * 0.5;
		var cursorY = multiplier * mapPos.y + multiplier * 0.5;
		svg.querySelector("polygon").setAttribute("transform", "translate(" + cursorX + "," + cursorY + ") rotate(" + mapPos.f * 90 + ")");
		svg.style.cursor = "pointer";
		svg.addEventListener("click", walkTo);

		return svg;
	}

	function walkableCell(x, y) {
		if ("1567".includes(RG.grid.charAt(31 * y + x))) return false;
		return !RG.pois.some((p) => !p.d && p.k === "monster" && p.x === x && p.y === y);
	}

	function walkTo(event) {
		event.stopPropagation();
		var box = event.currentTarget.getBoundingClientRect();
		var x = Math.floor(((event.clientX - box.left) / box.width) * 31);
		var y = Math.floor(((event.clientY - box.top) / box.height) * 31);
		if (!walkableCell(x, y)) return;
		var leave = document.getElementById("rgleave");
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "choice.php", true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // Needed to update their view ingame, sending a bunch of movements seems a bit odd.
		xhr.onload = () => location.reload();
		xhr.send("whichchoice=" + encodeURIComponent(leave.whichchoice.value) + "&pwd=" + encodeURIComponent(leave.pwd.value) +
			"&option=4&rgx=" + x + "&rgy=" + y + "&rgf=" + mapPos.f);
	}

	function svgToImage() {
		var img = new Image();
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(makeSvg().outerHTML);

		img.onload = function () {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			canvas.getContext("2d").drawImage(img, 0, 0);

			var link = document.createElement("a");
			link.download = "rose_garden_map.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
		};
	}

	var popupMap = undefined;
	var mapDiv = document.createElement("div");
	mapDiv.id = "inlineGardenMap";
	var wrap = document.getElementById("rgwrap");
	var wrapWidth = wrap.style.width;
	wrap.after(mapDiv);

	function showSVG() {
        // Toggles the inline map if we are using that, or it is visible
		if (document.getElementById("showMapInline").checked || document.body.classList.contains("inlineGardenMap")) {
			var show = document.body.classList.toggle("inlineGardenMap");
			setProperty("roseGarden_showMap", String(show));
			// Tells canvas to resize
			window.dispatchEvent(new Event("resize"));
			return;
		}

		popupMap = document.createElement("div");
		popupMap.style = "position:fixed;inset:0;z-index:99999";
		popupMap.onclick = () => {
			popupMap.remove();
			popupMap = undefined;
		};
		document.body.append(popupMap);
		drawMap();
	}

	function drawMap() {
		if (popupMap) {
			var svg = makeSvg();
			svg.style = "max-width:90%;max-height:90%";
			popupMap.replaceChildren(svg);
		}

        // Inline map
		if (document.body.classList.contains("inlineGardenMap")) {
			var view = document.getElementById("rgview");
			var svg = makeSvg();
			svg.style = "width:auto;height:" + view.style.height;
			mapDiv.replaceChildren(svg);
			// Shrink the game's box down to the canvas, so there's no gap between it and the map
			wrap.style.setProperty("width", view.style.width, "important");
		}
	}

	window.addEventListener("resize", () => {
        // Make sure game resizes properly
		wrap.style.width = wrapWidth;
		requestAnimationFrame(drawMap);
	});

	// Hijack the network to see when player moves
	var oldSend = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.send = function (body) {
		var params = new URLSearchParams(body);

		if (params.get("option") === "4") {
			mapPos = { x: params.get("rgx"), y: params.get("rgy"), f: params.get("rgf") };
			drawMap();
		}

		return oldSend.call(this, body);
	};

	var submitParts = ${JSON.stringify(parts)};

	async function submitGarden(button) {
		button.disabled = true;

		for (var part of submitParts) {
			var body = new URLSearchParams({
				action: "send",
				towho: "RoseGardenSpading",
				contact: "0",
				message: part,
				pwd: ${JSON.stringify(kol.myHash())},
			});
			var response = await fetch("sendmessage.php", { method: "POST", body });

			if (!(await response.text()).includes("Message sent.")) {
				button.textContent = "Submit failed, try again";
				button.disabled = false;

				return;
			}
		}

		await setProperty("roseGarden_submittedMap", ${JSON.stringify(String(mapHash))});
    // Make sure the game sees they are in the choice, so they don't get stuck in a weird state
		location.reload();
	}

	function setProperty(name, value) {
		return fetch("/KoLmafia/jsonApi", { method: "POST", body: new URLSearchParams({ pwd: ${JSON.stringify(kol.myHash())}, body: JSON.stringify({ functions: [{ name: "setProperty", args: [name, value] }] }) }) });
	}

	function toggleChoices() {
		var show = document.body.classList.toggle("rgchoices");
		document.getElementById("rgpois").classList.toggle("rgshow", show);
		setProperty("roseGarden_showChoices", String(show));
		window.dispatchEvent(new Event("resize"));
	}

	if (${!noCheating && kol.getProperty("roseGarden_showChoices") === "true"}) {
		document.body.classList.add("rgchoices");
		document.getElementById("rgpois").classList.add("rgshow");
	}
	</script>
	<style>#inlineGardenMap{display:none;vertical-align:top} body.inlineGardenMap #inlineGardenMap{display:inline-block} body.inlineGardenMap #rgwrap{display:inline-block!important;width:52vw!important;vertical-align:top}</style>
	<style>body.rgchoices #rgwrap, body.rgchoices #inlineGardenMap{display:none!important}</style>
	<div style="position:absolute;right:0;top:0;z-index:9999;display:flex">
		${
      noCheating
        ? ""
        : `<label title="Show the map next to the game"><input type="checkbox" id="showMapInline" onchange="setProperty('roseGarden_inlineMap', String(this.checked))" ${inlineMap ? "checked" : ""}>Inline</label>
		<button onclick="showSVG()" title="Show garden map, this is not the intended rose garden gameplay.">Show map</button>
		<button onclick="svgToImage()" title="Download garden map">Save map</button>
		<button onclick="toggleChoices()" title="Show the choices that KoL added for device compatibility, this is not the intended rose garden gameplay.">Show choices</button>`
    }
		<button onclick="submitGarden(this)" ${submitted ? "disabled" : ""} title="Submit garden data to assist spading effort.">${submitted ? "Submitted" : "Submit"}</button>
	</div>
	<script>
	if (${!noCheating && inlineMap && kol.getProperty("roseGarden_showMap") === "true"}) {
		showSVG();
	}
	</script>`;

  pageText = pageText.replace("</body>", `${button}</body>`);
  kol.write(pageText);
};
