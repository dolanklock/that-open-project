export function getActiveScreenshotImage() {
    const nodeList = document.querySelectorAll(".slide") as NodeList
    const slides = Array.from(nodeList) as HTMLDivElement[]
    const activeSlide = slides.find((slide) => {
        return slide.classList.contains("active")
    })
    const activeImage = activeSlide?.querySelector("img") as HTMLImageElement
    return activeImage.src
}