import { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './Select.module.scss';

type SelectOption = {
  title: string;
  id: string;
  group: string;
};

interface SelectProps {
  options: SelectOption[];
  multiselect: boolean;
  onChange: (selected: Map<string, HTMLOptionElement>) => void;
}

const Select = ({ ...props }: SelectProps) => {
  const { options, multiselect, onChange } = props;
  const [selected, setSelected] = useState(new Map());
  const [selectOptions, setSelectOptions] = useState(options);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Component CSS variables are generated globally via utils/generateCSSTokens.mjs

  useEffect(() => {
    if (!options || options.length < 1) return;
    setSelectOptions(options);
    if (options.length) {
      console.log('init select', selectOptions);
    }
  }, [options, selectOptions]);

  const handleSelect = (el: ChangeEvent<HTMLSelectElement>) => {
    const { target } = el;
    console.log(el, target, target.value, 'current selected:', selected);
    // TODO: Implement proper selection handling
    const newSelected = new Map();
    setSelected(newSelected);
    onChange(newSelected);
  };

  // set select options
  return (
    <>
      <select
        id="ma"
        ref={selectRef}
        onChange={handleSelect}
        multiple={multiselect}
        className={`${styles.select}`}
      >
        <option data-default>Choose an option</option>
        {selectOptions &&
          selectOptions.map((selectOption) => {
            return (
              <option id={selectOption.id} key={selectOption.id}>
                {selectOption.title}
              </option>
            );
          })}
      </select>
    </>
  );
};

export { Select };
