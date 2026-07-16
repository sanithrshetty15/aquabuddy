import { robotRepository, alertRepository, sensorRepository } from '../repositories';

const toCSV = (headers: string[], rows: any[], fieldMap: Record<string, string>): string => {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    headers.map(h => {
      const val = row[fieldMap[h] || h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
};

export const exportRobotsCSV = async (where: any = {}) => {
  const robots = await robotRepository.findMany(where, { orderBy: { createdAt: 'desc' } });
  const headers = ['code', 'name', 'model', 'status', 'lat', 'lng', 'waterGenerated', 'battery', 'hardwareVersion', 'createdAt'];
  const map: Record<string, string> = {
    code: 'code', name: 'name', model: 'model', status: 'status',
    lat: 'lat', lng: 'lng', waterGenerated: 'waterGenerated', battery: 'battery',
    hardwareVersion: 'hardwareVersion', createdAt: 'createdAt',
  };
  return toCSV(headers, robots, map);
};

export const exportRobotsJSON = async (where: any = {}) => {
  const robots = await robotRepository.findMany(where, { orderBy: { createdAt: 'desc' } });
  return robots.map((r: any) => ({
    code: r.code, name: r.name, model: r.model, status: r.status,
    location: { lat: r.lat, lng: r.lng },
    waterGenerated: r.waterGenerated, battery: r.battery,
    hardwareVersion: r.hardwareVersion, createdAt: r.createdAt,
  }));
};

export const exportAlertsCSV = async (where: any = {}) => {
  const alerts = await alertRepository.findMany(where, { orderBy: { createdAt: 'desc' } });
  const headers = ['robotId', 'type', 'severity', 'message', 'status', 'createdAt'];
  const map: Record<string, string> = {
    robotId: 'robotId', type: 'type', severity: 'severity',
    message: 'message', status: 'status', createdAt: 'createdAt',
  };
  return toCSV(headers, alerts, map);
};

export const exportSensorCSV = async (robotId: string) => {
  const readings = await sensorRepository.findByRobotId(robotId, 1000);
  const headers = ['humidity', 'temperature', 'waterFlow', 'waterLevel', 'powerConsumption', 'battery', 'createdAt'];
  const map: Record<string, string> = {
    humidity: 'humidity', temperature: 'temperature', waterFlow: 'waterFlow',
    waterLevel: 'waterLevel', powerConsumption: 'powerConsumption',
    battery: 'battery', createdAt: 'createdAt',
  };
  return toCSV(headers, readings, map);
};
