import React from 'react'
import { getLabelColorClasses } from '../utils/labelColors';

const Label = ({ color, name }) => {
  const colorClass = getLabelColorClasses(color);

  return (
    <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase shadow-sm ${colorClass}`}>
      {name}
    </div>
  );
};

export default Label;