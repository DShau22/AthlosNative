import React, { useState, useCallback, useEffect } from "react";
import { TextInput } from "react-native";

const ValidatedTextInput = (props) => {
  const {
    validationRegex, value, onChange,
    style, placeholderTextColor, keyboardType
  } = props
  const [validatedValue, setValidatedValue] = useState("");

  const validateOnChange = useCallback(
    newValue => {
      if (newValue === undefined) return;

      // Do validation of newValue here
      if (!validationRegex.test(newValue)) return;

      setValidatedValue(newValue);
      onChange && onChange(newValue);
    },
    [setValidatedValue, onChange]
  );

  useEffect(() => {
    validateOnChange(value);
  }, [validateOnChange, value]);

  return (
    <TextInput
      value={validatedValue}
      onChangeText={val => validateOnChange(val)}
      style={style}
      placeholderTextColor={placeholderTextColor}
      keyboardType={keyboardType}
    />
  );
};

export default ValidatedTextInput;