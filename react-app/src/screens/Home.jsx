import React from 'react'
// import Button from 'react-bootstrap/Button';
// import Card from 'react-bootstrap/Card';
import { Button, Card } from 'react-bootstrap';
import {
  HomeOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { FaBeer, FaAtlassian } from 'react-icons/fa';
import { DatePicker, Button as AntButton } from 'antd';

export const Home = () => {
  return (
    <div>
      <h1 className="w-4xl font-mono text-9xl hover:text-red-500 md:hover:bg-sky-700 font-light underline bg-emerald-500 text-amber-300">
        {/* <h1 className="w-4xl font-mono text-9xl hover:text-red-500 md:hover:bg-sky-700 font-light underline md:bg-emerald-500 text-amber-300"> */}
        Hello world!
      </h1>

      <div className="bg-white max-w-2xl dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
        <div>
          <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
            <svg
              className="h-6 w-6 stroke-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* SVG paths here */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </span>
        </div>

        <h3 className="text-gray-900 dark:text-white mt-5 text-base font-medium tracking-tight">
          Writes upside-down
        </h3>

        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          The Zero Gravity Pen can be used to write in any orientation,
          including upside-down. It even works in outer space.
        </p>
      </div>
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src="holder.js/100px180" />
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
            <AntButton className='custom-button' type="primary">Primary Button</AntButton>
            <DatePicker />
            <FaAtlassian />
            <FaBeer />
            <HomeOutlined spin />
            <SmileOutlined />
            <SmileOutlined rotate={180} />
          </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card></div>
  )
}
