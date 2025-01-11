import { educationTherapistLevels } from 'src/assets/data';

// ----------------------------------------------------------------------

export function getEducationTherapist(inputValue) {
  const option = educationTherapistLevels.filter(
    (education) => education.label === inputValue || education.value === inputValue
  )[0];

  return { value: option?.value, label: option?.label };
}

// ----------------------------------------------------------------------

export function displayValueByEducationValue(inputValue) {
  const option = educationTherapistLevels.filter((education) => education.code === inputValue)[0];

  return option.label;
}
