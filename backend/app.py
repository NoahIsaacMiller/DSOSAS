from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from datetime import datetime
from dateutil import parser
import json

# 加载环境变量
load_dotenv()

# 创建Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///./satellite.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 配置CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, origins=cors_origins, supports_credentials=True)

# 初始化数据库
db = SQLAlchemy(app)

# 定义数据模型
class Group(db.Model):
    __tablename__ = 'groups'
    
    id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(200))
    status = db.Column(db.Integer, default=1)
    create_at = db.Column(db.DateTime, default=datetime.utcnow)
    update_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    satellites = db.relationship('Satellite', secondary='satellite_groups', back_populates='groups')

class Satellite(db.Model):
    __tablename__ = 'satellites'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    line1 = db.Column(db.Text, nullable=False)
    line2 = db.Column(db.Text, nullable=False)
    status = db.Column(db.Integer, default=1)
    create_at = db.Column(db.DateTime, default=datetime.utcnow)
    update_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    groups = db.relationship('Group', secondary='satellite_groups', back_populates='satellites')

class SatelliteGroup(db.Model):
    __tablename__ = 'satellite_groups'
    
    satellite_id = db.Column(db.Integer, db.ForeignKey('satellites.id'), primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), primary_key=True)

# 辅助函数：计算轨道参数
def calculate_orbital_params(line1, line2):
    """基于TLE数据计算轨道参数（模拟实现）"""
    try:
        # 这里简化处理，实际应使用TLE解析库如skyfield或pysatellites
        return {
            "semiMajorAxis": 6778.137,  # 地球半径+近地轨道高度（示例值）
            "eccentricity": 0.0001,  # 接近圆形轨道
            "inclination": float(line2[8:16].strip()),  # 从TLE提取倾角
            "argumentOfPerigee": float(line2[34:42].strip()),  # 从TLE提取近地点幅角
            "rightAscension": float(line2[17:25].strip()),  # 从TLE提取升交点赤经
            "meanAnomaly": float(line2[43:51].strip()),  # 从TLE提取平近点角
            "period": 90.5  # 典型近地轨道周期（分钟）
        }
    except:
        return {
            "semiMajorAxis": 6778.137,
            "eccentricity": 0.0001,
            "inclination": 98.0,
            "argumentOfPerigee": 0.0,
            "rightAscension": 0.0,
            "meanAnomaly": 0.0,
            "period": 90.5
        }

# 辅助函数：格式化响应
def create_response(code=200, message="success", data=None):
    return jsonify({
        "code": code,
        "message": message,
        "data": data
    })

# 辅助函数：格式化分组数据
def format_group(group):
    return {
        "id": group.id,
        "groupName": group.group_name,
        "description": group.description,
        "status": group.status,
        "satelliteCount": len(group.satellites) if hasattr(group, 'satellites') else 0,
        "createAt": group.create_at.isoformat(),
        "updateAt": group.update_at.isoformat()
    }

# 辅助函数：格式化卫星数据
def format_satellite(satellite, include_orbital=False):
    data = {
        "id": satellite.id,
        "name": satellite.name,
        "line1": satellite.line1,
        "line2": satellite.line2,
        "status": satellite.status,
        "groups": [format_group(g) for g in satellite.groups],
        "createAt": satellite.create_at.isoformat(),
        "updateAt": satellite.update_at.isoformat()
    }
    
    if include_orbital:
        data["orbitalParams"] = calculate_orbital_params(satellite.line1, satellite.line2)
    
    return data

# 初始化数据库和测试数据
def init_database():
    with app.app_context():
        db.create_all()
        
        # 检查是否已有数据
        if Group.query.first() is None:
            # 创建默认分组
            default_groups = [
                Group(group_name="默认分组", description="系统默认分组"),
                Group(group_name="通讯卫星", description="用于通信的卫星"),
                Group(group_name="观测卫星", description="用于地球观测的卫星")
            ]
            db.session.add_all(default_groups)
            db.session.commit()
        
        if Satellite.query.first() is None:
            # 创建测试卫星数据
            test_satellites = [
                Satellite(
                    name="ISS (ZARYA)",
                    line1="1 25544U 98067A   23048.54974424  .00016717  00000-0  10270-3 0  9002",
                    line2="2 25544  51.6445 271.3223 0004195  86.0789 274.1359 15.50077880391451"
                ),
                Satellite(
                    name="TIANGONG-2",
                    line1="1 41787U 16057A   23048.00556250  .00000074  00000+0  10568-4 0  9997",
                    line2="2 41787  42.7753  96.0725 0003289  59.5299  15.7359 15.58877324118847"
                )
            ]
            db.session.add_all(test_satellites)
            db.session.commit()
            
            # 将卫星添加到默认分组
            default_group = Group.query.filter_by(group_name="默认分组").first()
            if default_group:
                for satellite in test_satellites:
                    satellite.groups.append(default_group)
                db.session.commit()

# 卫星相关接口
@app.route('/api/satellites', methods=['GET'])
def get_satellites():
    # 获取查询参数
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 20))
    keyword = request.args.get('keyword', '')
    group_id = request.args.get('groupId')
    status = request.args.get('status')
    
    # 构建查询
    query = Satellite.query
    
    if keyword:
        query = query.filter(Satellite.name.like(f'%{keyword}%'))
    
    if group_id:
        query = query.join(Satellite.groups).filter(Group.id == group_id)
    
    if status is not None:
        query = query.filter(Satellite.status == int(status))
    
    # 分页
    pagination = query.paginate(page=page, per_page=size)
    
    # 格式化响应
    satellites = [format_satellite(sat) for sat in pagination.items]
    
    return create_response(data={
        "total": pagination.total,
        "list": satellites,
        "page": page,
        "size": size
    })

@app.route('/api/satellites/<int:id>', methods=['GET'])
def get_satellite_detail(id):
    satellite = Satellite.query.get_or_404(id)
    return create_response(data=format_satellite(satellite, include_orbital=True))

@app.route('/api/satellites', methods=['POST'])
def add_satellite():
    data = request.json
    
    # 创建新卫星
    satellite = Satellite(
        name=data['name'],
        line1=data['line1'],
        line2=data['line2']
    )
    
    # 添加到分组
    if 'groupIds' in data:
        groups = Group.query.filter(Group.id.in_(data['groupIds'])).all()
        satellite.groups = groups
    
    db.session.add(satellite)
    db.session.commit()
    
    return create_response(data=format_satellite(satellite))

@app.route('/api/satellites/<int:id>', methods=['PUT'])
def edit_satellite(id):
    satellite = Satellite.query.get_or_404(id)
    data = request.json
    
    # 更新基本信息
    satellite.name = data['name']
    satellite.line1 = data['line1']
    satellite.line2 = data['line2']
    
    # 更新分组
    if 'groupIds' in data:
        groups = Group.query.filter(Group.id.in_(data['groupIds'])).all()
        satellite.groups = groups
    
    db.session.commit()
    
    return create_response(data=format_satellite(satellite))

@app.route('/api/satellites/<int:id>', methods=['DELETE'])
def delete_satellite(id):
    satellite = Satellite.query.get_or_404(id)
    db.session.delete(satellite)
    db.session.commit()
    
    return create_response(data=True)

@app.route('/api/satellites/<int:id>/export-tle', methods=['GET'])
def export_satellite_tle(id):
    satellite = Satellite.query.get_or_404(id)
    tle_content = f"{satellite.name}\n{satellite.line1}\n{satellite.line2}"
    
    # 返回TLE内容
    return create_response(data=tle_content)

# 分组相关接口
@app.route('/api/groups', methods=['GET'])
def get_groups():
    # 获取查询参数
    keyword = request.args.get('keyword', '')
    status = request.args.get('status')
    
    # 构建查询
    query = Group.query
    
    if keyword:
        query = query.filter(Group.group_name.like(f'%{keyword}%'))
    
    if status is not None:
        query = query.filter(Group.status == int(status))
    
    # 获取所有数据
    groups = query.all()
    
    return create_response(data={
        "total": len(groups),
        "list": [format_group(g) for g in groups]
    })

@app.route('/api/groups/<int:id>', methods=['GET'])
def get_group_detail(id):
    group = Group.query.get_or_404(id)
    return create_response(data=format_group(group))

@app.route('/api/groups', methods=['POST'])
def add_group():
    data = request.json
    
    group = Group(
        group_name=data['groupName'],
        description=data.get('description')
    )
    
    db.session.add(group)
    db.session.commit()
    
    return create_response(data=format_group(group))

@app.route('/api/groups/<int:id>', methods=['PUT'])
def edit_group(id):
    group = Group.query.get_or_404(id)
    data = request.json
    
    group.group_name = data['groupName']
    group.description = data.get('description')
    if 'status' in data:
        group.status = data['status']
    
    db.session.commit()
    
    return create_response(data=format_group(group))

@app.route('/api/groups/<int:id>', methods=['DELETE'])
def delete_group(id):
    group = Group.query.get_or_404(id)
    db.session.delete(group)
    db.session.commit()
    
    return create_response(data=True)

@app.route('/api/groups/<int:id>/satellites', methods=['GET'])
def get_group_satellites(id):
    group = Group.query.get_or_404(id)
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 20))
    
    # 分页处理
    start = (page - 1) * size
    end = start + size
    paginated_satellites = group.satellites[start:end]
    
    return create_response(data={
        "total": len(group.satellites),
        "list": [format_satellite(sat) for sat in paginated_satellites],
        "page": page,
        "size": size
    })

@app.route('/api/groups/<int:id>/satellites', methods=['POST'])
def associate_satellites(id):
    group = Group.query.get_or_404(id)
    data = request.json
    satellite_ids = data.get('satelliteIds', [])
    
    # 获取要关联的卫星
    satellites = Satellite.query.filter(Satellite.id.in_(satellite_ids)).all()
    
    # 关联卫星
    for satellite in satellites:
        if satellite not in group.satellites:
            group.satellites.append(satellite)
    
    db.session.commit()
    
    return create_response(data={
        "success": True,
        "associatedCount": len(satellites)
    })

@app.route('/api/groups/<int:id>/satellites', methods=['DELETE'])
def disassociate_satellites(id):
    group = Group.query.get_or_404(id)
    data = request.json
    satellite_ids = data.get('satelliteIds', [])
    
    # 解绑卫星
    initial_count = len(group.satellites)
    group.satellites = [sat for sat in group.satellites if sat.id not in satellite_ids]
    
    db.session.commit()
    
    return create_response(data={
        "success": True,
        "associatedCount": initial_count - len(group.satellites)
    })

# 场景相关接口
@app.route('/api/scene/orbital-params', methods=['POST'])
def get_batch_orbital_params():
    data = request.json
    satellite_ids = data.get('satelliteIds', [])
    
    # 获取卫星
    satellites = Satellite.query.filter(Satellite.id.in_(satellite_ids)).all()
    
    # 计算轨道参数
    result = {}
    for satellite in satellites:
        result[satellite.id] = calculate_orbital_params(satellite.line1, satellite.line2)
    
    return create_response(data=result)

@app.route('/api/scene/sync-tle', methods=['POST'])
def sync_latest_tle():
    # 模拟同步操作
    return create_response(data={"updatedCount": 0})

# 启动应用
if __name__ == '__main__':
    # 初始化数据库
    init_database()
    
    # 启动服务
    app.run(host='0.0.0.0', port=5002, debug=True)