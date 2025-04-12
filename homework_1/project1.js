//Please refer to the README for the code breakdown

function composite(bgImg, fgImg, fgOpac, fgPos) {

    var bgData = bgImg.data, fgData = fgImg.data;

    var bgWidth = bgImg.width, bgHeight = bgImg.height;

    var fgWidth = fgImg.width, fgHeight = fgImg.height;

    for (var y = 0; y < fgHeight; y++) {

        var bgY = y + fgPos.y;

        if (bgY < 0 || bgY >= bgHeight) {

            continue;
        }
        
        for (var x = 0; x < fgWidth; x++) {

            var bgX = x + fgPos.x;

            if (bgX < 0 || bgX >= bgWidth) {

                continue;
            }

            var fgIndex = (y * fgWidth + x) * 4, bgIndex = (bgY * bgWidth + bgX) * 4;

            var fgR = fgData[fgIndex], fgG = fgData[fgIndex + 1], fgB = fgData[fgIndex + 2];

            var fgAlpha = (fgData[fgIndex + 3] / 255) * fgOpac;

            var bgR = bgData[bgIndex], bgG = bgData[bgIndex + 1], bgB = bgData[bgIndex + 2], bgAlpha = bgData[bgIndex + 3] / 255;

            var outAlpha = fgAlpha + bgAlpha * (1 - fgAlpha);
            
            var outR, outG, outB;

            if (outAlpha > 0) {

                outR = (fgR * fgAlpha + bgR * bgAlpha * (1 - fgAlpha)) / outAlpha;

                outG = (fgG * fgAlpha + bgG * bgAlpha * (1 - fgAlpha)) / outAlpha;

                outB = (fgB * fgAlpha + bgB * bgAlpha * (1 - fgAlpha)) / outAlpha;

            } else {

                outR = outG = outB = 0;

            }

            bgData[bgIndex]     = Math.round(outR);

            bgData[bgIndex + 1] = Math.round(outG);

            bgData[bgIndex + 2] = Math.round(outB);
            
            bgData[bgIndex + 3] = Math.round(outAlpha * 255);
        }
    }
}
