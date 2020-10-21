let storeId = 177
let param = args.widgetParameter
if (param != null && param.length > 0) {
    storeId = param
}

const storeCapacity = await fetchAmountOfPaper()
const storeInfo = await fetchStoreInformation()
const widget = new ListWidget()
await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {

    const logoReq = new Request('https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Dm_Logo.svg/300px-Dm_Logo.svg.png')
    const logoImg = await logoReq.loadImage()

    widget.setPadding(10,10,10,10)
    widget.url = "https://www.dm.de/search?query=toilettenpapier&searchType=product"

    const titleFontSize = 12
    const detailFontSize = 36

    const wimg = widget.addImage(logoImg)
    wimg.imageSize = new Size(40, 40)
    wimg.rightAlignImage()
    widget.addSpacer()

    const iconReq = new Request('https://i.imgur.com/MoJUhoM.png')
    const icon = await iconReq.loadImage()
    let row = widget.addStack()
    row.layoutHorizontally()
    const iconImg = row.addImage(icon)
    iconImg.imageSize = new Size(40, 40)
    row.addSpacer(12)

    let column = row.addStack()
    column.layoutVertically()

    const paperText = column.addText("KLOPAPIER")
    paperText.font = Font.mediumRoundedSystemFont(14)

    const packageCount = column.addText(storeCapacity.toString())
    packageCount.font = Font.mediumRoundedSystemFont(22)
    if (storeCapacity < 30) {
        packageCount.textColor = new Color("#E50000")
    } else {
        packageCount.textColor = new Color("#00CD66")
    }
    widget.addSpacer(10)

    const row2 = widget.addStack()
    row2.layoutVertically()

    const street = row2.addText(storeInfo.address.street)
    street.font = Font.regularSystemFont(11)
    street.textColor = Color.black()

    const zipCity = row2.addText(storeInfo.address.zip + " " + storeInfo.address.city)
    zipCity.font = Font.regularSystemFont(11)
    zipCity.textColor = Color.black()

    let currentTime = new Date().toLocaleTimeString('de-DE', { hour: "numeric", minute: "numeric" })
    let currentDay = new Date().getDay()
    const todaysOpeningHour = storeInfo.openingHours[currentDay].timeRanges[0].opening
    const todaysClosingHour = storeInfo.openingHours[currentDay].timeRanges[0].closing
    const range = ['$todaysOpeningHour', '$todaysClosingHour'];
    const isOpen = isInRange(currentTime, range)

    /*
    const opened = row2.addText(todaysOpeningHour + " bis " + todaysClosingHour + " Uhr")
    opened.font = Font.regularSystemFont(11)
    opened.textColor = Color.black()
    */

    let shopStateText
    if (isOpen) {
        shopStateText = row2.addText('Geöffnet')
        shopStateText.textColor = new Color("#00CD66")
    } else {
        shopStateText = row2.addText('Geschlossen')
        shopStateText.textColor = new Color("#E50000")
    }
    shopStateText.font = Font.mediumSystemFont(11)
}

// fetches the amount of toilet paper packages
async function fetchAmountOfPaper() {
    const url = 'https://products.dm.de/store-availability/DE/availability?dans=595420,708997,137425,28171,485698,799358,863567,452740,610544,846857,709006,452753,879536,452744,485695,853483,594080,504606,593761,525943,842480,535981,127048,524535&storeNumbers=' + storeId
    const req = new Request(url)
    const apiResult = await req.loadJSON()
    let counter = 0
    for (var i in apiResult.storeAvailabilities) {
        counter += apiResult.storeAvailabilities[i][0].stockLevel
    }
    return counter
}

// fetches information of the configured store, e.g. opening hours, address etc.
async function fetchStoreInformation() {
    const url = 'https://store-data-service.services.dmtech.com/stores/item/de/' + storeId
    const req = new Request(url)
    const apiResult = await req.loadJSON()
    return apiResult
}

// checks whether the store is currently open or closed
function isInRange(value, range) {
    return value >= range[0] && value <= range[1];
}