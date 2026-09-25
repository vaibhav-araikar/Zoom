import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const features = [
  {
    Icon: SecurityRoundedIcon,
    title: "Secure by design",
    description:
      "Your conversations are protected with secure and reliable technology.",
    className: "orange-feature",
  },
  {
    Icon: GroupsRoundedIcon,
    title: "Connect with everyone",
    description:
      "Stay connected with friends, family, and teams from anywhere.",
    className: "purple-feature",
  },
  {
    Icon: BoltRoundedIcon,
    title: "Fast & reliable",
    description:
      "Enjoy smooth and dependable video calling whenever you need it.",
    className: "blue-feature",
  },
];

export default function Content() {
  return (
    <section className="auth-content">
      {/* Brand */}
      <div className="auth-brand">
        <div className="camera-logo">
          <div className="camera-lens"></div>
        </div>

        <div className="brand-name">
          Air <span>Video Call</span>
        </div>
      </div>

      {/* Hero */}
      <div className="auth-hero">
        <div className="small-heading">VIDEO CALLING, REIMAGINED</div>

        <h1>
          Stay connected
          <br />
          <span>no matter the distance.</span>
        </h1>

        <p>
          High-quality video calls made simple.
          <br />
          Connect with the people who matter most.
        </p>
      </div>

      {/* Features */}
      <div className="auth-features">
        {features.map((feature) => {
          const Icon = feature.Icon;

          return (
            <div className="auth-feature" key={feature.title}>
              <div className={`feature-icon ${feature.className}`}>
                <Icon />
              </div>

              <div className="feature-text">
                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <div className="auth-bottom">
        <span></span>

        <p>
          Better conversations.
          <br />
          <strong>Closer connections.</strong>
        </p>
      </div>
    </section>
  );
}
