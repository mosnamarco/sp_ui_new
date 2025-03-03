export default function SensorChip() {
  return (
    <div className="overflow-w-scroll flex gap-2">
      <div>
        <div className="flex flex-col gap-2 w-[20rem]">
          <div className="text-green-700 bg-green-200 rounded-lg w-full flex flex-col p-2 gap-2">
            <div className="flex justify-between gap-2 items-center">
              <span className="font-bold">[Sensor name]</span>
              <span>Feb 21 8:32 PM</span>
            </div>

            <div className="flex flex-col">
              <span className="text-lg">Current water level:</span>
              <span className="text-md">~19 Meters</span>
            </div>
          </div>

          <div className="text-green-700 bg-green-200 flex flex-col w-full border-l-4 border-green-700 rounded-lg p-2 gap-2">
            <div className="flex flex-col">
              <span className="text-lg">Predicted water level:</span>
              <span className="text-md">~8 Meters</span>
            </div>
            <span className="text-center font-bold text-lg">
              +9 Hours in 4 hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
