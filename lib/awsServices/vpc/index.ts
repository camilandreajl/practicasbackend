import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CIDR_RANGE, CUSTOMER, PROJECT } from '../../../config';

export class vpcConstructor extends Construct {
  buildVPC(deployEnvironment: string) {
    const identifier = `${CUSTOMER}-${PROJECT}-vpc-${deployEnvironment}`;
    const vpc = new ec2.Vpc(this, identifier, {
      vpcName: identifier,
      ipAddresses: ec2.IpAddresses.cidr(CIDR_RANGE),
      maxAzs: 2,
      natGateways: 0, // Disable NAT gateways
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Public',
          cidrMask: 24,
          // Enable auto-assign public IPv4 address
          mapPublicIpOnLaunch: true,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Private',
          cidrMask: 24,
        },
      ],
    });
    return vpc;
  }
}
