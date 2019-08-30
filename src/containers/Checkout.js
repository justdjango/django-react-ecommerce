import React, { Component } from "react";
import {
  CardElement,
  injectStripe,
  Elements,
  StripeProvider
} from "react-stripe-elements";
import {
  Button,
  Container,
  Dimmer,
  Divider,
  Form,
  Header,
  Image,
  Item,
  Label,
  Loader,
  Message,
  Segment,
  Select
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { authAxios } from "../utils";
import {
  checkoutURL,
  orderSummaryURL,
  addCouponURL,
  addressListURL
} from "../constants";

const OrderPreview = props => {
  const { data } = props;
  return (
    <React.Fragment>
      {data && (
        <React.Fragment>
          <Item.Group relaxed>
            {data.order_items.map((orderItem, i) => {
              return (
                <Item key={i}>
                  <Item.Image
                    size="tiny"
                    src={`http://127.0.0.1:8000${orderItem.item.image}`}
                  />
                  <Item.Content verticalAlign="middle">
                    <Item.Header as="a">
                      {orderItem.quantity} x {orderItem.item.title}
                    </Item.Header>
                    <Item.Extra>
                      <Label>${orderItem.final_price}</Label>
                    </Item.Extra>
                  </Item.Content>
                </Item>
              );
            })}
          </Item.Group>

          <Item.Group>
            <Item>
              <Item.Content>
                <Item.Header>
                  Order Total: ${data.total}
                  {data.coupon && (
                    <Label color="green" style={{ marginLeft: "10px" }}>
                      Current coupon: {data.coupon.code} for $
                      {data.coupon.amount}
                    </Label>
                  )}
                </Item.Header>
              </Item.Content>
            </Item>
          </Item.Group>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

class CouponForm extends Component {
  state = {
    code: ""
  };

  handleChange = e => {
    this.setState({
      code: e.target.value
    });
  };

  handleSubmit = e => {
    const { code } = this.state;
    this.props.handleAddCoupon(e, code);
    this.setState({ code: "" });
  };

  render() {
    const { code } = this.state;
    return (
      <React.Fragment>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Coupon code</label>
            <input
              placeholder="Enter a coupon.."
              value={code}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Button type="submit">Submit</Button>
        </Form>
      </React.Fragment>
    );
  }
}

class CheckoutForm extends Component {
  state = {
    data: null,
    loading: false,
    error: null,
    success: false,
    shippingAddresses: [],
    billingAddresses: [],
    selectedBillingAddress: "",
    selectedShippingAddress: ""
  };

  componentDidMount() {
    this.handleFetchOrder();
    this.handleFetchBillingAddresses();
    this.handleFetchShippingAddresses();
  }

  handleGetDefaultAddress = addresses => {
    const filteredAddresses = addresses.filter(el => el.default === true);
    if (filteredAddresses.length > 0) {
      return filteredAddresses[0].id;
    }
    return "";
  };

  handleFetchBillingAddresses = () => {
    this.setState({ loading: true });
    authAxios
      .get(addressListURL("B"))
      .then(res => {
        this.setState({
          billingAddresses: res.data.map(a => {
            return {
              key: a.id,
              text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
              value: a.id
            };
          }),
          selectedBillingAddress: this.handleGetDefaultAddress(res.data),
          loading: false
        });
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  };

  handleFetchShippingAddresses = () => {
    this.setState({ loading: true });
    authAxios
      .get(addressListURL("S"))
      .then(res => {
        this.setState({
          shippingAddresses: res.data.map(a => {
            return {
              key: a.id,
              text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
              value: a.id
            };
          }),
          selectedShippingAddress: this.handleGetDefaultAddress(res.data),
          loading: false
        });
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  };

  handleFetchOrder = () => {
    this.setState({ loading: true });
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        this.setState({ data: res.data, loading: false });
      })
      .catch(err => {
        if (err.response.status === 404) {
          this.props.history.push("/products");
        } else {
          this.setState({ error: err, loading: false });
        }
      });
  };

  handleAddCoupon = (e, code) => {
    e.preventDefault();
    this.setState({ loading: true });
    authAxios
      .post(addCouponURL, { code })
      .then(res => {
        this.setState({ loading: false });
        this.handleFetchOrder();
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  };

  handleSelectChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  submit = ev => {
    ev.preventDefault();
    this.setState({ loading: true });
    if (this.props.stripe) {
      this.props.stripe.createToken().then(result => {
        if (result.error) {
          this.setState({ error: result.error.message, loading: false });
        } else {
          this.setState({ error: null });
          const {
            selectedBillingAddress,
            selectedShippingAddress
          } = this.state;
          authAxios
            .post(checkoutURL, {
              stripeToken: result.token.id,
              selectedBillingAddress,
              selectedShippingAddress
            })
            .then(res => {
              this.setState({ loading: false, success: true });
            })
            .catch(err => {
              this.setState({ loading: false, error: err });
            });
        }
      });
    } else {
      console.log("Stripe is not loaded");
    }
  };

  render() {
    const {
      data,
      error,
      loading,
      success,
      billingAddresses,
      shippingAddresses,
      selectedBillingAddress,
      selectedShippingAddress
    } = this.state;

    return (
      <div>
        {error && (
          <Message
            error
            header="There was some errors with your submission"
            content={JSON.stringify(error)}
          />
        )}
        {loading && (
          <Segment>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
            <Image src="/images/wireframe/short-paragraph.png" />
          </Segment>
        )}

        <OrderPreview data={data} />
        <Divider />
        <CouponForm
          handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)}
        />
        <Divider />
        <Header>Select a billing address</Header>
        {billingAddresses.length > 0 ? (
          <Select
            name="selectedBillingAddress"
            value={selectedBillingAddress}
            clearable
            options={billingAddresses}
            selection
            onChange={this.handleSelectChange}
          />
        ) : (
          <p>
            You need to <Link to="/profile">add a billing address</Link>
          </p>
        )}
        <Header>Select a shipping address</Header>
        {shippingAddresses.length > 0 ? (
          <Select
            name="selectedShippingAddress"
            value={selectedShippingAddress}
            clearable
            options={shippingAddresses}
            selection
            onChange={this.handleSelectChange}
          />
        ) : (
          <p>
            You need to <Link to="/profile">add a shipping address</Link>
          </p>
        )}
        <Divider />

        {billingAddresses.length < 1 || shippingAddresses.length < 1 ? (
          <p>You need to add addresses before you can complete your purchase</p>
        ) : (
          <React.Fragment>
            <Header>Would you like to complete the purchase?</Header>
            <CardElement />
            {success && (
              <Message positive>
                <Message.Header>Your payment was successful</Message.Header>
                <p>
                  Go to your <b>profile</b> to see the order delivery status.
                </p>
              </Message>
            )}
            <Button
              loading={loading}
              disabled={loading}
              primary
              onClick={this.submit}
              style={{ marginTop: "10px" }}
            >
              Submit
            </Button>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const InjectedForm = withRouter(injectStripe(CheckoutForm));

const WrappedForm = () => (
  <Container text>
    <StripeProvider apiKey="">
      <div>
        <h1>Complete your order</h1>
        <Elements>
          <InjectedForm />
        </Elements>
      </div>
    </StripeProvider>
  </Container>
);

export default WrappedForm;
