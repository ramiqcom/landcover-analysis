import { Option, Options } from '../module/global';

type SelectProps = {
  options: Options;
  value: Option;
  onChange?: (value: Option) => void;
  disabled?: boolean;
  visible?: boolean;
};

/**
 * Select component
 * @param param0
 * @returns
 */
export function Select({
  options,
  value,
  onChange = () => null,
  disabled = false,
  visible = true,
}: SelectProps) {
  const optionsComponents = options.map((dict, index) => {
    const { value, label } = dict;
    return <option value={value} label={label} key={index} />;
  });

  return (
    <select
      value={value.value}
      style={{
        display: visible ? 'flex' : 'none',
      }}
      disabled={disabled}
      onChange={(e) => {
        onChange(options[e.target.selectedIndex]);
      }}
    >
      {optionsComponents}
    </select>
  );
}
