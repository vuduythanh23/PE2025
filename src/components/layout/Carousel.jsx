export default function Carousel() {
    return (
        <div className="relative w-full h-64 overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-3xl font-bold text-white">Sneakers Carousel</h2>
            </div>
        </div>
    )
}