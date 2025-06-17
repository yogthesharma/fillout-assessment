import React from "react";

export interface SvgProps {
  strokeColor?: string;
}

const FileIcon = ({ strokeColor = "#8C93A1" }: SvgProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.2798 2.29167H4.79165C4.33141 2.29167 3.95831 2.66476 3.95831 3.125V16.875C3.95831 17.3352 4.33141 17.7083 4.79165 17.7083H15.2083C15.6686 17.7083 16.0416 17.3352 16.0416 16.875V8.05351C16.0416 7.8325 15.9538 7.62054 15.7976 7.46426L10.8691 2.53574C10.7128 2.37946 10.5008 2.29167 10.2798 2.29167Z"
        stroke={strokeColor}
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M7.29169 11.0417H10.2084M7.29169 14.375H12.7084"
        stroke={strokeColor}
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M10.625 2.70833V6.875C10.625 7.33524 10.9981 7.70833 11.4583 7.70833H15.625"
        stroke={strokeColor}
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default FileIcon;
