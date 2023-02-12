import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slide } from '@material-ui/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const CalendarForm = () => {

	const [open, setOpen] = useState(false);

	useEffect(() => {
		axios.get('http://localhost:4040/api/eventCalendar/all')
			.then(response => {
				let responseData = response?.data
				setEvents(responseData);
			}
			);
	}, []);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const [events, setEvents] = useState([]);
	const { handleSubmit, handleChange, values, errors } = useFormik({
		initialValues: {
			id: events.length + 1,
			title: '',
			start: '',
			end: '',
			description: '',
			priority: '',
		},
		onSubmit: (values, { resetForm }) => {

			resetForm();
			handleClose()
			creatEventApi(values);
		},
		validate: (values) => {
			const errors = {};
			if (!values.title) {
				errors.title = 'Required';
			}
			if (!values.start) {
				errors.start = 'Required';
			}
			if (!values.end) {
				errors.end = 'Required';
			}
			if (!values.description) {
				errors.description = 'Required';
			}
			if (!values.priority) {
				errors.priority = 'Required';
			}
			return errors;
		},
	});

	const creatEventApi = (params) => {

		const eventCalendarData = {
			eventCalendar:
			{
				"title": params?.title,
				"description": params?.description,
				"start": params?.start,
				"end": params?.end,
				"textColor": "#ffffff",
				"backgroundColor": getColor(values.priority),
				"priority": params?.priority,
			}
		}
		axios.post('http://localhost:4040/api/eventCalendar', eventCalendarData)
			.then(response => {
				let responseData = response?.data
				setEvents([
					...events,
					{
						_id: responseData?._id,
						title: responseData?.title,
						start: responseData?.start,
						end: responseData?.end,
						description: responseData?.description,
						priority: responseData?.priority,
						backgroundColor: responseData?.backgroundColor,
					},
				]);
			}
			);
	}

	const updateEventApi = (params) => {

		const eventCalendarData = {
			eventCalendar:
			{
				"_id": params?._id,
				"title": params?.title,
				"description": params?.description,
				"start": params?.start,
				"end": params?.end,
				"textColor": "#ffffff",
				"backgroundColor": getColor(values.priority),
				"priority": params?.priority,
			}
		}
		axios.put('http://localhost:4040/api/eventCalendar', eventCalendarData)
			.then(response => {
				let responseData = response?.data

				// update event 
				const oldEventList = events.filter((event) => event._id != _id)
				setEvents(oldEventList);
				setEvents([
					...oldEventList,
					{
						_id: responseData?._id,
						title: responseData?.title,
						start: responseData?.start,
						end: responseData?.end,
						description: responseData?.description,
						priority: responseData?.priority,
						backgroundColor: responseData?.backgroundColor,
					},
				]);
			}
			);
	}

	const getColor = (priority) => {
		switch (priority) {
			case 'High':
				return 'green';
			case 'Medium':
				return 'orange';
			case 'Low':
				return 'blue';
			default:
				return 'gray';
		}
	};

	const handleEventDrop = (info) => {
		const event = info.event;
		const newStart = info.event.start;
		const _id = event._def.extendedProps._id
		const newEnd = info.event.end;
		const oldEvent = events.find(e => e._id === _id);
		const newEvent = { ...oldEvent, start: newStart, end: newEnd };
		updateEventApi(newEvent);
	};

	return (
		<div style={{ padding: '20px' }}>

			<Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-labelledby="event-form-dialog">
				<form onSubmit={handleSubmit}>
					<DialogTitle id="event-form-dialog">Create New Event</DialogTitle>
					<DialogContent>
						<TextField
							id="title"
							name="title"
							label="Event Title"
							variant="outlined"
							fullWidth
							onChange={handleChange}
							value={values.title}
							error={Boolean(errors.title)}
							helperText={errors.title}
							InputLabelProps={{ shrink: true, required: true }}
							style={{ marginBottom: 16 }}
						/>
						<TextField
							id="start"
							name="start"
							label="Event Start Date"
							type="datetime-local"
							variant="outlined"
							fullWidth
							onChange={handleChange}
							value={values.start}
							error={Boolean(errors.start)}
							helperText={errors.start}
							InputLabelProps={{ shrink: true, required: true }}
							style={{ marginBottom: 16 }}
						/>
						<TextField
							id="end"
							name="end"
							label="Event End Date"
							type="datetime-local"
							variant="outlined"
							fullWidth
							onChange={handleChange}
							value={values.end}
							error={Boolean(errors.end)}
							helperText={errors.end}
							InputLabelProps={{ shrink: true, required: true }}
							style={{ marginBottom: 16 }}
						/>
						<TextField
							id="description"
							name="description"
							label="Event Description"
							variant="outlined"
							fullWidth
							onChange={handleChange}
							value={values.description}
							error={Boolean(errors.description)}
							helperText={errors.description}
							InputLabelProps={{ shrink: true, required: true }}
							style={{ marginBottom: 16 }}
						/>
						<TextField
							id="priority"
							name="priority"
							select
							label="Event Priority"
							value={values.priority}
							onChange={handleChange}
							error={Boolean(errors.priority)}
							helperText={errors.priority}
							variant="outlined"
							fullWidth
							SelectProps={{
								native: true,
							}}
							style={{ marginBottom: 16 }}
							InputLabelProps={{ shrink: true, required: true }}
						>
							<option value="">Select Priority</option>
							<option value="High">High</option>
							<option value="Medium">Medium</option>
							<option value="Low">Low</option>
						</TextField>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" color="primary" type="submit" disabled={Object.keys(errors).length > 0}>
							Save
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			<div style={{ float: "left", width: "75%" }}>
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					headerToolbar={{
						left: "prev,next today",
						center: "title",
						right: "dayGridMonth,timeGridWeek,timeGridDay"
					}}
					initialView="dayGridMonth"
					editable={true}
					selectable={true}
					selectMirror={true}
					dayMaxEvents={true}
					events={[...events].map(event => ({
						...event,
						backgroundColor: getColor(event.priority),
					}))}
					droppable={true}
					eventDrop={handleEventDrop}
				// eventReceive={handleEventReceive}
				/>
			</div>
			<Button variant="contained" color="primary" onClick={handleOpen}>
				Add Event
			</Button>
			<table>
				<tr>
					<th>Title</th>
					<th>Priority</th>
				</tr>
				{events && events.map((val, i) => {
					return (
						<tr key={val._id}>
							<td>{val.title}</td>
							<td style={{ color: getColor(val?.priority) }}>{val?.priority}</td>
						</tr>
					)
				})}
			</table>
		</div>
	);
};

export default CalendarForm;
