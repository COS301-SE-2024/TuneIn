import React, { useState } from "react";
import ReactDatePicker from "react-datepicker";

// TypeScript type for the date value
type DatePickerProps = {
	selectedDate: Date | null;
	onDateChange: (date: Date | null) => void;
};

const DatePickerComponent: React.FC<DatePickerProps> = ({
	selectedDate,
	onDateChange,
}) => {
	return (
		<div>
			<h2>Select a Date</h2>
			<ReactDatePicker
				selected={selectedDate}
				onChange={onDateChange}
				dateFormat="yyyy/MM/dd"
				placeholderText="Select a date"
			/>
		</div>
	);
};

const App: React.FC = () => {
	const [date, setDate] = useState<Date | null>(null);

	return (
		<div>
			<h1>Date Picker Example</h1>
			<DatePickerComponent
				selectedDate={date}
				onDateChange={(date) => setDate(date)}
			/>
			{date && <p>Selected Date: {date.toDateString()}</p>}
		</div>
	);
};

export default App;
