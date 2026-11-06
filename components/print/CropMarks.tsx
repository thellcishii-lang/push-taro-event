export default function CropMarks() {
  return (
    <svg
      className="crop-marks"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#000" strokeWidth="0.05" vectorEffect="non-scaling-stroke">
        {/* 各コーナーのトンボ */}
        <line x1="0" y1="0" x2="4" y2="0" />
        <line x1="0" y1="0" x2="0" y2="4" />
        <line x1="100" y1="0" x2="96" y2="0" />
        <line x1="100" y1="0" x2="100" y2="4" />
        <line x1="0" y1="100" x2="4" y2="100" />
        <line x1="0" y1="100" x2="0" y2="96" />
        <line x1="100" y1="100" x2="96" y2="100" />
        <line x1="100" y1="100" x2="100" y2="96" />
      </g>
    </svg>
  );
}
