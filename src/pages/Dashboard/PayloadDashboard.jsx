import React from "react";
import {
  Row,
  Col,
  Table,
  Spin,
} from "antd";
import {
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getPayloadDetailedMetrics } from "../../services/statistics";

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.1) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#ff8279"];

const RADIAN = Math.PI / 180;

export default function PayloadDashboard() {
  const [payloadMetrics, setPayloadMetrics] = React.useState(null);
  const chartData = React.useMemo(() => {
    if (!payloadMetrics) return [];
    return [
      { name: "Đang rảnh", value: payloadMetrics.idle },
      { name: "Đang hoạt động", value: payloadMetrics.working },
      { name: "Đang sạc", value: payloadMetrics.charging },
      { name: "Đang bảo trì", value: payloadMetrics.fixing },
    ]
  }, [payloadMetrics]);
  const lineChartData = React.useMemo(() => {
    console.log({ payloadMetrics })
    const getMonthData = (month) => {
      return {
        fixing: payloadMetrics?.fee?.fixing?.filter(item => (new Date(item.startedAt)).getMonth() === month).length || 0,
        working: payloadMetrics?.fee?.working?.filter(item => (new Date(item.startedAt)).getMonth() === month).length || 0,
      }
    }
    const data = Array.from(Array(12).keys()).map(month => ({
      name: `Th${month + 1}`,
      ...getMonthData(month),
    }));
    return data;
  }, [payloadMetrics]);

  React.useEffect(() => {
    const fetchAll = async () => {
      const payload = await getPayloadDetailedMetrics();
      console.log({ payload })
      setPayloadMetrics(payload);
    }

    fetchAll();
  }, []);

  return (
    <>
      <h1>Payload</h1>
      {!payloadMetrics ? (
        <Spin />
      ) : (
        <Row>
          <Col span={8} offset={2}>
            <h3>Tổng quan</h3>
            <ResponsiveContainer
              height={300}
              width={300}
              className="alight-item-center"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  cx={100}
                  cy={100}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  margin={{ bottom: 10 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend style={{ marginTop: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </Col>
          <Col span={14}>
            <h3>Chi phí hoạt động và sửa chữa</h3>
            <LineChart
              width={500}
              height={300}
              data={lineChartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fixing" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="working" stroke="#82ca9d" />
            </LineChart>
          </Col>
        </Row>
      )}
    </>
  );
}
