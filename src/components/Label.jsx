import React from 'react'
import { getLabelColorClasses } from '../utils/labelColors';

const Label = ({ label }) => {
  const colorClass = getLabelColorClasses(label.color);

  return (
    <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase shadow-sm ${colorClass}`}>
      {label.name}
    </div>
  );
};

export default Label;